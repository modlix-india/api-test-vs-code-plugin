import React, { useCallback, useEffect, useState } from "react";

// @ts-ignore
const vscode = acquireVsCodeApi();

export function Editor() {
  const [currentDocument, setCurrentDocument] = useState();

  const documentChangeCallback = useCallback((ev: any) => {
    const msg = ev.data;
    if (msg.type !== "update") return;
    setCurrentDocument(msg.text);
    vscode.setState({ text: msg.text });
  }, []);

  useEffect(() => {
    window.addEventListener("message", documentChangeCallback);
    return () => window.removeEventListener("message", documentChangeCallback);
  }, []);

  return (
    <div>
      Hi this is the editor v2....<pre>{currentDocument}</pre>
    </div>
  );
}
