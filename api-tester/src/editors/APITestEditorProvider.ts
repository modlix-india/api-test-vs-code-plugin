import * as vscode from "vscode";

const MSG_TYP_ERROR = "error";
const MSG_TYP_DOCCHANGE = "docchange";
const MSG_TYP_SEND = "send";

const PLG_MSG_TYP_UPDATE = "update";
const PLG_MSG_TYP_RUNNING = "running";
const PLG_MSG_TYP_DONE = "done";

export class APITestEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new APITestEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      "api-tester.apitEditor",
      provider
    );
    return providerRegistration;
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: PLG_MSG_TYP_UPDATE,
        name: document.fileName,
        text: document.getText(),
        workspaceFolder: vscode.workspace.getWorkspaceFolder(document.uri),
      });
    }

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          updateWebview();
        }
      }
    );

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
            vscode.window.showErrorMessage(
              `${e.error.name} : ${e.error.message}`
            );
          } else {
            vscode.window.showErrorMessage("" + e.error);
          }
          break;
        case MSG_TYP_SEND:
          webviewPanel.webview.postMessage({
            type: PLG_MSG_TYP_RUNNING,
          });
          setTimeout(
            () =>
              webviewPanel.webview.postMessage({
                type: PLG_MSG_TYP_DONE,
              }),
            3000
          );
          break;
      }
    });

    updateWebview();
  }

  getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "index.js")
    );

    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "index.css")
    );

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <div id="app"></div>
        <script src="${scriptUri}"></script>
        <link rel="stylesheet" href="${cssUri}" />
      </body>
    </html>
    `;
  }

  private updateTextDocument(document: vscode.TextDocument, json: any) {
    const edit = new vscode.WorkspaceEdit();

    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      JSON.stringify(json, null, 2)
    );

    return vscode.workspace.applyEdit(edit);
  }

  private getDocumentAsJson(document: vscode.TextDocument): any {
    const text = document.getText();
    if (text.trim().length === 0) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "Could not get document as json. Content is not valid json"
      );
    }
  }
}
