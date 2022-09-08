import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react';
import React, { useEffect, useState } from 'react';
import { AddressBar } from './AddressBar';
import { RequestPanel } from './RequestPanel';

import * as services from '../services/editorServices';
import { ResponsePanel } from './ResponsePanel';
import { deepEqual } from '../util/deepEqual';

export function APIEditor({
    readOnly,
    currentDocument: inDocument,
    vscode,
    environments,
    currentEnvironment,
    responseData,
}) {
    const [currentDocument, setCurrentDocument] = useState<any>({});

    useEffect(() => {
        if (deepEqual(currentDocument, inDocument)) return;

        setCurrentDocument(inDocument);
    }, [inDocument]);

    return (
        <>
            <AddressBar
                readOnly={readOnly}
                document={currentDocument}
                onMethodChange={(m) => setCurrentDocument(services.onHttpMethodChange(m, currentDocument, vscode))}
                onUrlChange={(u) => setCurrentDocument(services.onUrlChange(u, currentDocument, vscode))}
                onSend={() => services.onSend(currentDocument, currentEnvironment, vscode)}
                environments={environments}
                currentEnvironment={currentEnvironment}
                onEnvironmentChange={(e) => services.onChangeEnvironment(e, vscode)}
            />
            <RequestPanel
                readOnly={readOnly}
                document={currentDocument}
                onChange={(v) => setCurrentDocument(services.onDocumentChange(v, currentDocument, vscode))}
                onError={(err) => services.onError(err, vscode)}
            />
            <VSCodeDivider />
            <ResponsePanel readOnly={readOnly} responseData={responseData} />
        </>
    );
}
