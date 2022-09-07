import { VSCodePanels, VSCodePanelTab, VSCodePanelView } from '@vscode/webview-ui-toolkit/react';
import React from 'react';
import { ParamsPanel } from './ParamsPanel';
import { convertToArray } from '../util/convertToArray';
import { BodyData } from './BodyData';

export function RequestPanel({ readOnly, document, onChange, onError }) {
    return (
        <VSCodePanels style={{ flex: 1 }}>
            <VSCodePanelTab id="params">Query Params</VSCodePanelTab>
            <VSCodePanelTab id="headers">Headers</VSCodePanelTab>
            <VSCodePanelTab id="body">Body</VSCodePanelTab>
            <VSCodePanelTab id="preScript">Pre Script</VSCodePanelTab>
            <VSCodePanelTab id="postScript">Post Script</VSCodePanelTab>
            <VSCodePanelView id="paramsPanel">
                <ParamsPanel
                    readOnly={readOnly}
                    onChange={onChange}
                    params={document.params}
                    paramsArray={document.paramsArray ?? convertToArray(document.params)}
                    sectionName={'params'}
                    arraySectionName={'paramsArray'}
                />
            </VSCodePanelView>
            <VSCodePanelView id="headersPanel">
                <ParamsPanel
                    readOnly={readOnly}
                    onChange={onChange}
                    params={document.headers}
                    paramsArray={document.headersArray ?? convertToArray(document.headers)}
                    sectionName={'headers'}
                    arraySectionName={'headersArray'}
                />
            </VSCodePanelView>
            <VSCodePanelView id="bodyPanel">
                <BodyData readOnly={readOnly} document={document} onChange={onChange} onError={onError} />
            </VSCodePanelView>
            <VSCodePanelView id="preScriptPanel">Coming Soon...</VSCodePanelView>
            <VSCodePanelView id="postScriptPanel">Coming Soon...</VSCodePanelView>
        </VSCodePanels>
    );
}
