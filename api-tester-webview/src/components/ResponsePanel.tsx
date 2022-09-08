import { VSCodePanels, VSCodePanelTab, VSCodePanelView } from '@vscode/webview-ui-toolkit/react';
import React, { useEffect, useState } from 'react';
import { ParamsPanel } from './ParamsPanel';

const RESPONSE_CODES = {
    '100': 'Continue',
    '101': 'Switching Protocols',
    '200': 'OK',
    '201': 'Created',
    '202': 'Accepted',
    '203': 'Non-Authoritative Information',
    '204': 'No Content',
    '205': 'Reset Content',
    '206': 'Partial Content',
    '300': 'Multiple Choices',
    '301': 'Moved Permanently',
    '302': 'Found',
    '303': 'See Other',
    '304': 'Not Modified',
    '305': 'Use Proxy',
    '307': 'Temporary Redirect',
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '402': 'Payment Required',
    '403': 'Forbidden',
    '404': 'Not Found',
    '405': 'Method Not Allowed',
    '406': 'Not Acceptable',
    '407': 'Proxy Authentication Required',
    '408': 'Request Timeout',
    '409': 'Conflict',
    '410': 'Gone',
    '411': 'Length Required',
    '412': 'Precondition Failed',
    '413': 'Payload Too Large',
    '414': 'URI Too Long',
    '415': 'Unsupported Media Type',
    '416': 'Range Not Satisfiable',
    '417': 'Expectation Failed',
    '426': 'Upgrade Required',
    '500': 'Internal Server Error',
    '501': 'Not Implemented',
    '502': 'Bad Gateway',
    '503': 'Service Unavailable',
    '504': 'Gateway Timeout',
    '505': 'HTTP Version Not Supported',
};

export function ResponsePanel({ readOnly, responseData }) {
    const [reqHeaders, setReqHeaders] = useState<any>();
    const [respHeaders, setRespHeaders] = useState<any>();

    useEffect(() => {
        setReqHeaders(Object.entries(responseData?.config?.headers ?? {}).map((e) => [e[0], ...e]));
        setRespHeaders(Object.entries(responseData?.headers ?? {}).map((e) => [e[0], ...e]));
    }, [responseData]);

    if (readOnly || !responseData) {
        let inner = (
            <span
                style={{
                    fontSize: '50px',
                    animation: 'rotating 3s linear infinite',
                    color: '#2977D1',
                }}
                className="codicon codicon-issue-reopened"
            />
        );
        if (!responseData) {
            inner = (
                <span
                    style={{
                        fontSize: '100px',
                        color: '#2977D1',
                    }}
                    className="codicon codicon-symbol-interface"
                />
            );
        }
        return (
            <div
                style={{
                    minHeight: '200px',
                    display: 'flex',
                    flex: '1.5',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'auto',
                }}
            >
                {inner}
            </div>
        );
    }

    let message = <></>;
    if (responseData.message) {
        message = (
            <>
                <span style={{ color: 'var(--panel-tab-foreground)', marginLeft: '10px' }}>Message : </span>
                <span style={{ fontWeight: 'bold' }}>{responseData.message}</span>
            </>
        );
    }

    let statusCode = <></>;
    if (responseData.status) {
        statusCode = (
            <>
                <span style={{ color: 'var(--panel-tab-foreground)' }}>Status Code : </span>
                <span style={{ fontWeight: 'bold' }}>{responseData.status}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--button-primary-background)', marginLeft: '4px' }}>
                    {RESPONSE_CODES[responseData.status]}
                </span>
            </>
        );
    }

    return (
        <>
            <div style={{ paddingBottom: '4px', fontSize: '11px', textAlign: 'right', paddingRight: '25px' }}>
                {statusCode}
                {message}
            </div>

            <VSCodePanels style={{ height: '100%', flex: '1.5' }}>
                <VSCodePanelTab id="body">Body</VSCodePanelTab>
                <VSCodePanelTab id="reqHeaders">Request Headers</VSCodePanelTab>
                <VSCodePanelTab id="respHeaders">Response Headers</VSCodePanelTab>
                <VSCodePanelView id="bodyPanel" style={{ flexDirection: 'column' }}>
                    <div style={{ flex: '1', borderLeft: '8px solid', paddingLeft: '10px' }}>
                        <pre style={{ whiteSpace: 'break-spaces' }}>
                            {JSON.stringify(responseData.data, undefined, 2)}
                        </pre>
                    </div>
                </VSCodePanelView>
                <VSCodePanelView id="reqHeadersPanel">
                    <div style={{ flex: '1' }}>
                        <ParamsPanel
                            readOnly={true}
                            onChange={() => {}}
                            params={responseData.config.headers ?? {}}
                            paramsArray={reqHeaders}
                            sectionName="s"
                            arraySectionName="ss"
                        />
                    </div>
                </VSCodePanelView>
                <VSCodePanelView id="respHeadersPanel">
                    <div style={{ flex: '1' }}>
                        <ParamsPanel
                            readOnly={true}
                            onChange={() => {}}
                            params={responseData.headers ?? {}}
                            paramsArray={respHeaders}
                            sectionName="s"
                            arraySectionName="ss"
                        />
                    </div>
                </VSCodePanelView>
            </VSCodePanels>
        </>
    );
}
