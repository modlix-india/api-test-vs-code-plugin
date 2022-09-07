import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react';
import React from 'react';
import { AddressBar } from './AddressBar';
import { RequestPanel } from './RequestPanel';

import * as services from '../services/editorServices';
import { ResponsePanel } from './ResponsePanel';

export function APIEditor({ readOnly, currentDocument, vscode, environments, currentEnvironment, responseData }) {
    return (
        <>
            <AddressBar
                readOnly={readOnly}
                document={currentDocument}
                onMethodChange={(m) => services.onHttpMethodChange(m, currentDocument, vscode)}
                onUrlChange={(u) => services.onUrlChange(u, currentDocument, vscode)}
                onSend={() => services.onSend(currentDocument, currentEnvironment, vscode)}
                environments={environments}
                currentEnvironment={currentEnvironment}
                onEnvironmentChange={(e) => services.onChangeEnvironment(e, vscode)}
            />
            <RequestPanel
                readOnly={readOnly}
                document={currentDocument}
                onChange={(v) => services.onDocumentChange(v, currentDocument, vscode)}
                onError={(err) => services.onError(err, vscode)}
            />
            <VSCodeDivider />
            <ResponsePanel readOnly={readOnly} responseData={responseData} />
        </>
    );
}
