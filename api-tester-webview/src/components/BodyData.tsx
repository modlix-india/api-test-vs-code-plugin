import {
    VSCodeDivider,
    VSCodeDropdown,
    VSCodeOption,
    VSCodeRadio,
    VSCodeTextArea,
} from '@vscode/webview-ui-toolkit/react';
import React, { useEffect, useState } from 'react';
import { convertToArray } from '../util/convertToArray';
import { ParamsPanel } from './ParamsPanel';

const rawTypes = {
    json: ['application/json', 'JSON'],
    text: ['text/plain', 'Text'],
    html: ['text/html', 'HTML'],
    xml: ['application/xml', 'XML'],
    js: ['text/javascript', 'Javascript'],
};

export function BodyData({ readOnly, document, onChange, onError }) {
    const [textBody, setTextBody] = useState('');

    let bodyEditor = <></>;
    let bodyType = document.backup?.bodyType;
    let bodySubType: string | undefined = document.backup?.bodySubType;

    if (bodyType === undefined || bodyType === null) {
        bodyType = 'raw';
    }

    if (bodySubType === undefined || bodySubType === null) {
        bodySubType = 'json';
    }

    useEffect(() => {
        if (bodyType !== 'raw' || !document.backup?.rawdata) {
            setTextBody('');
            return;
        }
        if (bodySubType === 'json') {
            try {
                let x: any = document.backup.rawdata ?? {};
                if (typeof x === 'object') x = JSON.stringify(x, undefined, 2);
                setTextBody(x);
            } catch (error) {
                onError(error);
                setTextBody('');
            }
        } else setTextBody(document.backup.rawdata);
    }, [bodyType, document]);

    let subTypeEditor = <></>;
    if (bodyType === 'none') {
        bodyEditor = <div> No Body for this request </div>;
    } else if (bodyType === 'form-data' || bodyType === 'x-www-form-urlencoded') {
        bodyEditor = (
            <ParamsPanel
                readOnly={readOnly}
                onChange={onChange}
                params={document.data}
                paramsArray={document.backup?.dataArray ?? convertToArray(document.data ?? document.backup.data)}
                sectionName={'data'}
                arraySectionName={'backup.dataArray'}
            />
        );
    } else if (bodyType === 'raw') {
        function textAreaChanged(e) {
            let x = (e.target as HTMLInputElement).value;
            let data: any = x;
            if (bodySubType === 'json') {
                try {
                    data = JSON.parse(x);
                } catch (error) {
                    onError(error);
                    data = {};
                }
            }
            onChange([
                ['backup.rawdata', x],
                ['data', data],
            ]);
        }

        bodyEditor = (
            <VSCodeTextArea
                readOnly={readOnly}
                rows={12}
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
                onKeyUp={(e) => {
                    if (e.metaKey || e.ctrlKey) textAreaChanged(e);
                }}
                onBlur={textAreaChanged}
            />
        );

        subTypeEditor = (
            <VSCodeDropdown
                id="subtype"
                value={bodySubType}
                onChange={(e) => {
                    let data: any = document.backup.rawdata;
                    if (e.target.value === 'json') {
                        try {
                            if (typeof data !== 'object') data = JSON.parse('' + data);
                        } catch (err) {
                            onError(err);
                            data = {};
                        }
                    } else {
                        if (typeof data === 'object') data = JSON.stringify(data, undefined, 2);
                    }
                    onChange([
                        ['backup.bodySubType', e.target.value],
                        ['backup.bodyType', 'raw'],
                        ['headers.Content-Type', rawTypes[e.target.value][0]],
                        ['data', data],
                        ['backup.rawdata', data],
                    ]);
                }}
                disabled={readOnly}
            >
                {Object.entries(rawTypes).map(([k, [, label]]) => (
                    <VSCodeOption key={k} label={label} value={k}>
                        {label}
                    </VSCodeOption>
                ))}
            </VSCodeDropdown>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1' }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '4x' }}>
                {['none', 'form-data', 'x-www-form-urlencoded', 'raw'].map((e) => (
                    <VSCodeRadio
                        readOnly={readOnly}
                        key={e}
                        checked={bodyType === e}
                        onClick={() => {
                            onChange(toBodyType(document, bodySubType, e, onError));
                        }}
                    >
                        {e}
                    </VSCodeRadio>
                ))}
                {subTypeEditor}
            </div>
            <VSCodeDivider />
            {bodyEditor}
        </div>
    );
}

function toBodyType(document: any, bodySubType: string | undefined, toBodyType: string, onError) {
    if (toBodyType === 'none')
        return [
            ['data', undefined],
            ['backup.bodyType', toBodyType],
            ['headers.Content-Type', undefined],
        ];

    if (toBodyType === 'form-data' || toBodyType === 'x-www-form-urlencoded') {
        let data = (document.backup?.dataArray ?? [])
            .filter(([, , , bool]) => bool)
            .reduce((a: any, [, k, v]) => {
                a[k] = v;
                return a;
            }, {});

        return [
            ['data', data],
            ['backup.bodySubType', bodySubType],
            ['backup.bodyType', toBodyType],
            ['backup.data', data],
            [
                'headers.Content-Type',
                toBodyType === 'form-data' ? 'multipart/form-data' : 'application/x-www-form-urlencoded',
            ],
        ];
    }

    bodySubType = !bodySubType || bodySubType === 'none' ? 'json' : bodySubType;

    if (toBodyType === 'raw') {
        let data: any = document.backup.rawdata;
        if (bodySubType === 'json') {
            try {
                data = JSON.parse(data);
            } catch (err) {
                onError(err);
                data = {};
            }
        }
        return [
            ['headers.Content-Type', rawTypes[bodySubType][0]],
            ['backup.bodySubType', bodySubType],
            ['backup.bodyType', toBodyType],
            ['data', data],
        ];
    }
}
