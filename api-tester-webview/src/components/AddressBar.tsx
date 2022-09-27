import { VSCodeButton, VSCodeDropdown, VSCodeOption, VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import React, { useEffect, useState } from 'react';

export function AddressBar({
    document,
    readOnly,
    onMethodChange,
    onUrlChange,
    onSend,
    environments,
    currentEnvironment,
    onEnvironmentChange,
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
            <VSCodeDropdown
                id="methods"
                value={document.method ?? 'get'}
                onChange={(e) => onMethodChange(e.target.value)}
                disabled={readOnly}
            >
                <VSCodeOption label="GET" value="get">
                    Get
                </VSCodeOption>
                <VSCodeOption label="POST" value="post">
                    Post
                </VSCodeOption>
                <VSCodeOption label="PUT" value="put">
                    Put
                </VSCodeOption>
                <VSCodeOption label="PATCH" value="patch">
                    Patch
                </VSCodeOption>
                <VSCodeOption label="DELETE" value="delete">
                    Delete
                </VSCodeOption>
                <VSCodeOption label="OPTIONS" value="options">
                    Options
                </VSCodeOption>
                <VSCodeOption label="HEAD" value="head">
                    Head
                </VSCodeOption>
            </VSCodeDropdown>
            <VSCodeTextField
                id="address"
                value={document.url ?? ''}
                onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                        setTimeout(() => onSend(), 800);
                        return;
                    }
                    let v = (e.target as HTMLInputElement).value;
                    onUrlChange(v);
                }}
                style={{ flex: '1' }}
                disabled={readOnly}
            ></VSCodeTextField>
            <VSCodeButton onClick={onSend} disabled={readOnly}>
                Send
            </VSCodeButton>
            <VSCodeDropdown
                id="environments"
                value={currentEnvironment ?? ''}
                disabled={readOnly}
                onChange={(e) => onEnvironmentChange(e.target.value)}
            >
                {environments.map((e) => (
                    <VSCodeOption key={e} label={e} value={e}>
                        {e}
                    </VSCodeOption>
                ))}
                <VSCodeOption label={'Nothing'} value={''}>
                    {'No var'}
                </VSCodeOption>
            </VSCodeDropdown>
        </div>
    );
}
