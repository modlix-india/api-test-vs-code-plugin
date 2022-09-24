import React, { useCallback, useEffect, useState } from 'react';
import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react';

import { Title } from './Title';
import { VAREditor } from './VAREditor';

// @ts-ignore
const vscode = acquireVsCodeApi();

const PLG_MSG_TYP_UPDATE = 'update';

export function VarEditorLauncher() {
    const [currentDocument, setCurrentDocument] = useState<any>({});
    const [name, setName] = useState({ fileName: '', folderName: '' });

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
                fileName = msg.name.replace(msg.workspaceFolder.uri.path + '/', '');
                fileName = fileName.replace(/\.(apit|var)/gi, '');
            }

            const ind = fileName.lastIndexOf('/');
            let folderName = '';
            if (ind !== -1) {
                folderName = fileName.substring(0, ind);
                fileName = fileName.substring(ind + 1);
            }
            setName({ fileName, folderName });

            vscode.setState({ text: msg.text });
        }
    }, []);

    useEffect(() => {
        window.addEventListener('message', documentChangeCallback);
        return () => window.removeEventListener('message', documentChangeCallback);
    }, []);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Title folderName={name.folderName} fileName={name.fileName} />
            <VSCodeDivider />
            <VAREditor currentDocument={currentDocument} vscode={vscode} />
        </div>
    );
}
