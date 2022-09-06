import * as vscode from 'vscode';
import { getNonce } from '../util/nonce';

const MSG_TYP_ERROR = 'error';
const MSG_TYP_DOCCHANGE = 'docchange';

const PLG_MSG_TYP_UPDATE = 'update';

export class VARTestEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new VARTestEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider('api-tester.varEditor', provider, {
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

        function updateWebview() {
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
            }
        });

        updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'index.js'));
        const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'index.css'));

        return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <div id="app"></div>
        <script nonce="${getNonce()}" src="${scriptUri}"></script>
        <link rel="stylesheet" href="${cssUri}" />
      </body>
    </html>
    `;
    }

    private updateTextDocument(document: vscode.TextDocument, json: any) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(json, null, 2));

        return vscode.workspace.applyEdit(edit);
    }
}
