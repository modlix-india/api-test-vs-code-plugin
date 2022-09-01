import { VSCodeButton, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import React from "react";
import "@vscode/codicons/dist/codicon.css";

import { UUID } from "../util/uuid";
import { EditOnClick } from "./EditOnClick";

const firstColumn = {
  width: "55px",
  borderRight: "1px solid",
  height: "26px",
  display: "flex",
  alignItems: "center",
  padding: "3px 3px",
  gap: "3px",
};

const secondColumn = {
  flex: "1",
  borderRight: "1px solid",
  height: "26px",
  display: "flex",
  alignItems: "center",
  padding: "3px 3px",
};

const thirdColumn = {
  flex: "1",
  height: "26px",
  display: "flex",
  alignItems: "center",
  padding: "3px 3px",
};

export function ParamsPanel({
  readOnly,
  onChange,
  params,
  paramsArray,
  sectionName,
}) {
  const rows = [...(paramsArray ?? []), [UUID(), "", "", true]].map(
    ([id, k, v, include], i) => (
      <div
        key={id}
        style={{ display: "flex", flexDirection: "row", border: "1px solid" }}
      >
        <div style={firstColumn}>
          {k === "" ? (
            <></>
          ) : (
            <>
              <VSCodeButton
                onClick={() => {
                  const newParams = { ...params };
                  delete newParams[k];

                  let newParamsArray = [...(paramsArray ?? [])];
                  newParamsArray.splice(
                    newParamsArray.findIndex(([oid]) => oid == id),
                    1
                  );
                  onChange([
                    [sectionName, newParams],
                    [sectionName + "Array", newParamsArray],
                  ]);
                }}
                appearance="icon"
              >
                <span className="codicon codicon-trash" />
              </VSCodeButton>
              <VSCodeCheckbox
                checked={include}
                onChange={(e) => {
                  const newInclude = (e.target as HTMLInputElement).checked;
                  const newParams = { ...params };
                  if (!newInclude) delete newParams[k];
                  else newParams[k] = v;
                  let newParamsArray = [...(paramsArray ?? [])];
                  newParamsArray.splice(
                    newParamsArray.findIndex(([oid]) => oid == id),
                    1,
                    [id, k, v, newInclude]
                  );
                  onChange([
                    [sectionName, newParams],
                    [sectionName + "Array", newParamsArray],
                  ]);
                }}
              />
            </>
          )}
        </div>
        <div style={secondColumn}>
          <EditOnClick
            readOnly={readOnly}
            value={k}
            onChange={(key: string) => {
              if (key === "" || key.trim() === "" || key === k) return;
              if (k === "") {
                onChange([
                  [sectionName, { ...params, [key]: v }],
                  [
                    sectionName + "Array",
                    [...(paramsArray ?? []), [id, key, v, include]],
                  ],
                ]);
                return;
              }
              const newParams = { ...params, [key]: v };
              delete newParams[k];
              let newParamsArray = [...(paramsArray ?? [])];
              newParamsArray.splice(
                newParamsArray.findIndex(([oid]) => oid == id),
                1,
                [id, key, v, include]
              );
              onChange([
                [sectionName, newParams],
                [sectionName + "Array", newParamsArray],
              ]);
            }}
            placeholder={"Key"}
          />
        </div>
        <div style={thirdColumn}>
          <EditOnClick
            readOnly={readOnly || k === ""}
            value={v}
            onChange={(value: string) => {
              if (value === "" || value.trim() === "" || value === v) return;

              const newParams = { ...params, [k]: value };
              let newParamsArray = [...(paramsArray ?? [])];
              newParamsArray.splice(
                newParamsArray.findIndex(([oid]) => oid == id),
                1,
                [id, k, value, include]
              );
              onChange([
                [sectionName, newParams],
                [sectionName + "Array", newParamsArray],
              ]);
            }}
            placeholder={"Value"}
          />
        </div>
      </div>
    )
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        flex: "1",
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "row", border: "1px solid" }}
      >
        <div style={firstColumn}></div>
        <div style={{ ...secondColumn, fontWeight: "bold" }}>
          <span>KEY</span>
        </div>
        <div style={{ ...thirdColumn, fontWeight: "bold" }}>
          <span>VALUE</span>
        </div>
      </div>
      {rows}
    </div>
  );
}
