import React from 'react';
import { onDocumentChange, onError } from '../services/editorServices';
import { EDITOR_TYPES } from './EditOnClick';
import { ParamsPanel } from './ParamsPanel';

export function VAREditor({ currentDocument, vscode }) {
    return (
        <ParamsPanel
            readOnly={false}
            params={currentDocument.variables ?? {}}
            paramsArray={currentDocument.variablesArray ?? []}
            sectionName={'variables'}
            arraySectionName={'variablesArray'}
            onChange={(c) => onDocumentChange(c, currentDocument ?? {}, vscode)}
            valueTypes={[EDITOR_TYPES.BOOLEAN, EDITOR_TYPES.NUMBER, EDITOR_TYPES.STRING, EDITOR_TYPES.JSON]}
            onError={(err) => onError(err, vscode)}
        />
    );
}
