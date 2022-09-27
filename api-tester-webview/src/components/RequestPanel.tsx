import { VSCodePanels, VSCodePanelTab, VSCodePanelView, VSCodeTextArea } from '@vscode/webview-ui-toolkit/react';
import React, { useEffect, useState } from 'react';
import { ParamsPanel } from './ParamsPanel';
import { convertToArray } from '../util/convertToArray';
import { BodyData } from './BodyData';

function checkError(code) {
    try {
        new Function('settings', 'console', 'response', code);
        return '';
    } catch (err) {
        return err.message;
    }
}

export function RequestPanel({ readOnly, document, onChange, onError }) {
    const postScript = document.backup?.postScript ?? '';
    const [hasPostScriptError, setHasPostScriptError] = useState<string>(checkError(postScript));

    function onPostScriptChange(changedPostScript) {
        setHasPostScriptError(checkError(changedPostScript));
        if (changedPostScript === (document.backup?.postScript ?? '')) return;
        onChange([['backup.postScript', changedPostScript]]);
    }

    const textboxStyle = { fontFamily: 'monospace', flex: 1, border: hasPostScriptError ? '2px solid red' : 'none' };

    let errPostScriptMessage = <></>;
    if (hasPostScriptError != '') {
        errPostScriptMessage = (
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    color: 'white',
                    backgroundColor: 'red',
                    zIndex: 1,
                    padding: '3px',
                    opacity: '0.6',
                    borderRadius: '3px',
                }}
            >
                {hasPostScriptError}
            </div>
        );
    }

    const postScriptEditor = (
        <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
            {errPostScriptMessage}
            <VSCodeTextArea
                style={textboxStyle}
                readOnly={readOnly}
                rows={12}
                value={postScript}
                onKeyUp={(e) => {
                    let x = (e.target as HTMLInputElement).value;
                    onPostScriptChange(x);
                }}
            />
        </div>
    );

    return (
        <VSCodePanels style={{ flex: 1 }}>
            <VSCodePanelTab id="params">Query Params</VSCodePanelTab>
            <VSCodePanelTab id="headers">Headers</VSCodePanelTab>
            <VSCodePanelTab id="body">Body</VSCodePanelTab>
            <VSCodePanelTab id="postScript">Post Send Script</VSCodePanelTab>
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
            <VSCodePanelView id="postScriptPanel">{postScriptEditor}</VSCodePanelView>
        </VSCodePanels>
    );
}
