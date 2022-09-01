import { VSCodeDivider, VSCodeRadio } from "@vscode/webview-ui-toolkit/react";
import React from "react";
import { ParamsPanel } from "./ParamsPanel";

export function BodyData({ readOnly, document, onChange }) {
  let bodyEditor = <></>;
  let bodyType = document.bodyBackup?.bodyType;
  let bodySubType = 'none';

  if (bodyType === undefined || bodyType === null) {
    bodyType = typeof document.data === "object" ? "raw" : "none";
  }

  if (bodySubType === undefined || bodySubType ===  null) {
    bodySubType = typeof document.data === "object" ? "application/json" : "none";
  }

  if (bodyType === "none") {
    bodyEditor = <div> No Body for this request </div>;
  } else if (bodyType === "form-data" || bodyType === "x-www-form-urlencoded") {
    bodyEditor = <ParamsPanel
    onChange={onChange}
    params={document.data}
    paramsArray={document.bodyBackup?}
    sectionName={"bodyBackup"}
    />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
      <div style={{ display: "flex", flexDirection: "row", gap: "4x" }}>
        {["none", "form-data", "x-www-form-urlencoded", "raw", "binary"].map(
          (e) => (
            <VSCodeRadio
              readOnly={readOnly}
              key={e}
              checked={bodyType === e}
              onChange={() => onChange([["bodyBackup", {
                ...(document.bodyBackup ?? {}),
                bodyType,
                bodySubType,
                data: document.data
              }]])}
            >
              {e}
            </VSCodeRadio>
          )
        )}
      </div>
      <VSCodeDivider />
      {bodyEditor}
    </div>
  );
}
