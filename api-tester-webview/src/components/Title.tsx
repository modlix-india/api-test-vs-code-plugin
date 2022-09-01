import React from "react";

export function Title({ folderName, fileName }) {
  if (folderName)
    return (
      <h4>
        {folderName} / {fileName}
      </h4>
    );

  return <h4>{fileName}</h4>;
}
