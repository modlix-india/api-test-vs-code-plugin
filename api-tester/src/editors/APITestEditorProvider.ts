import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { runAxiosRequest } from '../util/runAxiosRequest';

const MSG_TYP_ERROR = 'error';
const MSG_TYP_DOCCHANGE = 'docchange';
const MSG_TYP_SEND = 'send';
const MSG_TYP_ENVCHANGE = 'envchange';

const PLG_MSG_TYP_UPDATE = 'update';
const PLG_MSG_TYP_RUNNING = 'running';
const PLG_MSG_TYP_DONE = 'done';
const PLG_MSG_TYP_ENVIRONMENTS = 'environments';
const PLG_MSG_TYP_CURRENT_ENVIRONMENT = 'currentEnvironment';

export class APITestEditorProvider implements vscode.CustomTextEditorProvider {
    private sWatcher: vscode.FileSystemWatcher | undefined;
    private wsWatcher: vscode.FileSystemWatcher | undefined;

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new APITestEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider('api-tester.apiEditor', provider, {
            webviewOptions: { retainContextWhenHidden: true },
        });
        return providerRegistration;
    }

    constructor(private readonly context: vscode.ExtensionContext) {}

    resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken,
    ): void | Thenable<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

        function readEnvironments(wsFolder: vscode.Uri) {
            vscode.workspace.fs.readDirectory(wsFolder).then((files) => {
                let envs = files
                    .map((e) => e[0])
                    .filter((e) => e.toUpperCase().endsWith('.VAR'))
                    .filter((e) => e.toUpperCase() !== 'GLOBAL.VAR');
                webviewPanel.webview.postMessage({
                    type: PLG_MSG_TYP_ENVIRONMENTS,
                    environments: envs,
                });
            });
        }

        function readSettings(settings: vscode.Uri) {
            vscode.workspace.fs.readFile(settings).then((array) => {
                const data = Buffer.from(array).toString();
                try {
                    const jsonSettings = JSON.parse(data);
                    webviewPanel.webview.postMessage({
                        type: PLG_MSG_TYP_CURRENT_ENVIRONMENT,
                        currentEnvironment: jsonSettings.environment,
                    });
                } catch (err) {}
            });
        }

        let _that = this;
        function updateWebview() {
            if (workspaceFolder?.uri?.fsPath) {
                readEnvironments(workspaceFolder?.uri);

                const settings = vscode.Uri.file(path.resolve(workspaceFolder?.uri?.fsPath, '.settings'));
                const hasSettings = vscode.workspace.fs.stat(settings);
                hasSettings.then(() => {
                    readSettings(settings);
                    if (!_that.sWatcher) {
                        _that.sWatcher = vscode.workspace.createFileSystemWatcher(
                            new vscode.RelativePattern(workspaceFolder?.uri?.fsPath, '.settings'),
                        );
                        _that.sWatcher.onDidChange(() => readSettings(settings));
                    }
                });

                if (!_that.wsWatcher) {
                    _that.wsWatcher = vscode.workspace.createFileSystemWatcher(
                        new vscode.RelativePattern(workspaceFolder.uri.fsPath, '*.var'),
                    );
                    _that.wsWatcher.onDidChange(() => readEnvironments(workspaceFolder.uri));
                    _that.wsWatcher.onDidCreate(() => readEnvironments(workspaceFolder.uri));
                    _that.wsWatcher.onDidDelete(() => readEnvironments(workspaceFolder.uri));
                }

                webviewPanel.onDidChangeViewState((e) => {
                    if (e.webviewPanel.active) {
                        readSettings(settings);
                        readEnvironments(workspaceFolder.uri);
                    }
                });
            }

            webviewPanel.webview.postMessage({
                type: PLG_MSG_TYP_UPDATE,
                name: document.fileName,
                text: document.getText(),
                workspaceFolder,
            });
        }

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
            this.wsWatcher?.dispose();
            this.sWatcher?.dispose();
        });

        webviewPanel.webview.onDidReceiveMessage((e) => {
            switch (e.type) {
                case MSG_TYP_DOCCHANGE:
                    this.updateTextDocument(document, e.document);
                    break;
                case MSG_TYP_ERROR:
                    if (e.error?.name && e.error?.message) {
                        vscode.window.showErrorMessage(`${e.error.name} : ${e.error.message}`);
                    } else {
                        vscode.window.showErrorMessage('' + e.error);
                    }
                    break;
                case MSG_TYP_SEND:
                    webviewPanel.webview.postMessage({
                        type: PLG_MSG_TYP_RUNNING,
                    });

                    runAxiosRequest(e.document, e.environment, workspaceFolder?.uri?.fsPath, (data, time, err) => {
                        if (data?.request) {
                            delete data.request.res;
                            delete data.request.socket;
                            delete data.request._redirectable;

                            try {
                                JSON.stringify(data.request);
                            } catch (err) {
                                delete data.request;
                            }
                        }

                        if (err) {
                            vscode.window.showErrorMessage(`${err?.name} : ${err?.message}`);
                        }
                        webviewPanel.webview.postMessage({
                            type: PLG_MSG_TYP_DONE,
                            data: { ...data, totalTimeTaken: time },
                        });
                    });

                    break;
                case MSG_TYP_ENVCHANGE:
                    if (workspaceFolder) {
                        const settings = path.resolve(workspaceFolder.uri.fsPath, '.settings');
                        const settingsURI = vscode.Uri.file(path.resolve(workspaceFolder?.uri?.fsPath, '.settings'));
                        const hasSettings = fs.existsSync(settings);
                        if (hasSettings) {
                            fs.readFile(settings, 'utf8', (err, data) => {
                                try {
                                    const obj = JSON.parse(data);
                                    obj.environment = e.environment;
                                    fs.writeFile(settings, JSON.stringify(obj, undefined, 2), 'utf8', (err) => {
                                        readSettings(settingsURI);
                                    });
                                } catch (err) {}
                            });
                        } else {
                            fs.writeFile(
                                settings,
                                JSON.stringify({ environment: e.environment }, undefined, 2),
                                'utf8',
                                (err) => {
                                    readSettings(settingsURI);
                                },
                            );
                        }
                    }
            }
        });

        updateWebview();
    }

    getHtmlForWebview(webview: vscode.Webview): string {
        if (this.context) {
            const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'index.js'));
            const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'index.css'));

            return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <style>
        @-webkit-keyframes rotating {
            from{
                -webkit-transform: rotate(360deg);
            }
            to{
                -webkit-transform: rotate(10deg);
            }
        }
        </style>
      </head>
      <body style="height:100vh; overflow: hidden; display: flex;">
        <div id="app" style="flex:1;display:flex"></div>
        <script src="${scriptUri}"></script>
        <link rel="stylesheet" href="${cssUri}" />
      </body>
    </html>
    `;
        }

        return '';
    }

    private updateTextDocument(document: vscode.TextDocument, json: any) {
        const edit = new vscode.WorkspaceEdit();

        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(json, null, 2));

        return vscode.workspace.applyEdit(edit);
    }
}
