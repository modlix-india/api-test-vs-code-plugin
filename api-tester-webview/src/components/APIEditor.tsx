import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react';
import React from 'react';
import { AddressBar } from './AddressBar';
import { RequestPanel } from './RequestPanel';

import * as services from '../services/editorServices';

export function APIEditor({ readOnly, currentDocument, vscode }) {
    return (
        <>
            <AddressBar
                readOnly={readOnly}
                document={currentDocument}
                onMethodChange={(m) => services.onHttpMethodChange(m, currentDocument, vscode)}
                onUrlChange={(u) => services.onUrlChange(u, currentDocument, vscode)}
                onSend={() => services.onSend(currentDocument, vscode)}
            />
            <RequestPanel
                readOnly={readOnly}
                document={currentDocument}
                onChange={(v) => services.onDocumentChange(v, currentDocument, vscode)}
                onError={(err) => services.onError(err, vscode)}
            />
            <VSCodeDivider />
        </>
    );
}
