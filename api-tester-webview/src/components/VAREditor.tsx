import React, { useEffect, useState } from 'react';
import { onDocumentChange, onError } from '../services/editorServices';
import { deepEqual } from '../util/deepEqual';
import { EDITOR_TYPES } from './EditOnClick';
import { ParamsPanel } from './ParamsPanel';

export function VAREditor({ currentDocument: inDocument, vscode }) {
    const [currentDocument, setCurrentDocument] = useState<any>({});

    useEffect(() => {
        if (deepEqual(currentDocument, inDocument)) return;

        setCurrentDocument(inDocument);
    }, [inDocument]);

    return (
        <ParamsPanel
            readOnly={false}
            params={currentDocument.variables ?? {}}
            paramsArray={currentDocument.variablesArray ?? []}
            sectionName={'variables'}
            arraySectionName={'variablesArray'}
            onChange={(c) => setCurrentDocument(onDocumentChange(c, currentDocument ?? {}, vscode))}
            valueTypes={[EDITOR_TYPES.BOOLEAN, EDITOR_TYPES.NUMBER, EDITOR_TYPES.STRING, EDITOR_TYPES.JSON]}
            onError={(err) => onError(err, vscode)}
        />
    );
}
