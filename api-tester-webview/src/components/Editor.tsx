import React, { useCallback, useEffect, useState } from "react";
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";

import { Title } from "./Title";
import { AddressBar } from "./AddressBar";
import { RequestPanel } from "./RequestPanel";

import * as services from "../services/editorServices";

// @ts-ignore
const vscode = acquireVsCodeApi();

const PLG_MSG_TYP_UPDATE = "update";
const PLG_MSG_TYP_RUNNING = "running";
const PLG_MSG_TYP_DONE = "done";

export function Editor() {
  const [currentDocument, setCurrentDocument] = useState<any>({});
  const [name, setName] = useState({ fileName: "", folderName: "" });
  const [, setWorkspaceFolder] = useState();
  const [readOnly, setReadOnly] = useState(false);

  const documentChangeCallback = useCallback((ev: any) => {
    const msg = ev.data;
    if (msg.type === PLG_MSG_TYP_UPDATE) {
      let json = {};

      try {
        json = JSON.parse(msg.text);
      } catch (err) {}

      setCurrentDocument(json);

      let fileName: string = msg.name;
      if (msg.workspaceFolder?.uri?.path) {
        fileName = msg.name.replace(msg.workspaceFolder.uri.path + "/", "");
        fileName = fileName.replace(".apit", "");
      }

      const ind = fileName.lastIndexOf("/");
      let folderName = "";
      if (ind !== -1) {
        folderName = fileName.substring(0, ind);
        fileName = fileName.substring(ind + 1);
      }

      setName({ fileName, folderName });
      setWorkspaceFolder(msg.workspaceFolder);

      vscode.setState({ text: msg.text });
    } else if (msg.type === PLG_MSG_TYP_RUNNING) {
      setReadOnly(true);
    } else if (msg.type === PLG_MSG_TYP_DONE) {
      setReadOnly(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", documentChangeCallback);
    return () => window.removeEventListener("message", documentChangeCallback);
  }, []);

  return (
    <div>
      <Title folderName={name.folderName} fileName={name.fileName} />
      <VSCodeDivider />
      <AddressBar
        readOnly={readOnly}
        document={currentDocument}
        onMethodChange={(m) =>
          services.onHttpMethodChange(m, currentDocument, vscode)
        }
        onUrlChange={(u) => services.onUrlChange(u, currentDocument, vscode)}
        onSend={() => services.onSend(currentDocument, vscode)}
      />
      <RequestPanel
        readOnly={readOnly}
        document={currentDocument}
        onChange={(v) => services.onDocumentChange(v, currentDocument, vscode)}
      />
      <VSCodeDivider />
    </div>
  );
}
