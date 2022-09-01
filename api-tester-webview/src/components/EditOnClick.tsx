import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import React, { useEffect, useState } from "react";

export function EditOnClick({
  readOnly,
  value,
  onChange,
  placeholder,
  editMode = true,
}) {
  const [editModeInternal, setEditMode] = useState(editMode);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  if (!editModeInternal) {
    <span
      tabIndex={0}
      onClick={() => {
        setEditMode(true);
      }}
    >
      {localValue == "" ? placeholder : localValue}
    </span>;
  }

  return (
    <VSCodeTextField
      readOnly={readOnly}
      autofocus={true}
      value={localValue}
      placeholder={placeholder}
      style={{ flex: "1" }}
      onKeyDown={(e) => {
        if (e.metaKey || e.ctrlKey)
          onChange((e.target as HTMLInputElement).value);
      }}
      onBlur={(e) => {
        onChange((e.target as HTMLInputElement).value);
        setEditMode(false || editMode);
      }}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
}
