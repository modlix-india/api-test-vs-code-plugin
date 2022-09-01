import {
  VSCodePanels,
  VSCodePanelTab,
  VSCodePanelView,
} from "@vscode/webview-ui-toolkit/react";
import React from "react";
import { ParamsPanel } from "./ParamsPanel";
import { UUID } from "../util/uuid";
import { BodyData } from "./BodyData";

function convertToArray(params) {
  return Object.entries(params ?? {}).map(([k, v]) => [UUID(), k, v, true]);
}

export function RequestPanel({ readOnly, document, onChange }) {
  return (
    <VSCodePanels style={{ minHeight: "300px" }}>
      <VSCodePanelTab id="params">Query Params</VSCodePanelTab>
      <VSCodePanelTab id="headers">Headers</VSCodePanelTab>
      <VSCodePanelTab id="body">Body</VSCodePanelTab>
      <VSCodePanelTab id="preScript">Pre Script</VSCodePanelTab>
      <VSCodePanelTab id="postScript">Post Script</VSCodePanelTab>
      <VSCodePanelView id="paramsPanel">
        <ParamsPanel
          readOnly={readOnly}
          onChange={onChange}
          params={document.params}
          paramsArray={document.paramsArray ?? convertToArray(document.params)}
          sectionName={"params"}
        />
      </VSCodePanelView>
      <VSCodePanelView id="headersPanel">
        <ParamsPanel
          readOnly={readOnly}
          onChange={onChange}
          params={document.headers}
          paramsArray={
            document.headersArray ?? convertToArray(document.headers)
          }
          sectionName={"headers"}
        />
      </VSCodePanelView>
      <VSCodePanelView id="bodyPanel">
        <BodyData readOnly={readOnly} document={document} onChange={onChange} />
      </VSCodePanelView>
      <VSCodePanelView id="preScriptPanel"></VSCodePanelView>
      <VSCodePanelView id="postScriptPanel"></VSCodePanelView>
    </VSCodePanels>
  );
}
