import {
    VSCodeDivider,
    VSCodeDropdown,
    VSCodeOption,
    VSCodeRadio,
    VSCodeTextArea,
} from '@vscode/webview-ui-toolkit/react';
import React, { useEffect, useState } from 'react';
import { convertToArray } from '../util/convertToArray';
import { deepEqual } from '../util/deepEqual';
import { UUID } from '../util/uuid';
import { ParamsPanel } from './ParamsPanel';

const rawTypes = {
    json: ['application/json', 'JSON'],
    text: ['text/plain', 'Text'],
    html: ['text/html', 'HTML'],
    xml: ['application/xml', 'XML'],
    js: ['text/javascript', 'Javascript'],
};

export function BodyData({ readOnly, document, onChange, onError }) {
    let bodyEditor = <></>;
    let bodyType = document.backup?.bodyType;
    let bodySubType: string | undefined = document.backup?.bodySubType;

    if (bodyType === undefined || bodyType === null) {
        bodyType = 'none';
    }

    if (bodyType === 'raw' && (bodySubType === undefined || bodySubType === null)) {
        bodySubType = 'json';
    }

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

            if (!deepEqual(x, document.backup.rawdata)) onChange([['backup.rawdata', x]]);
        }

        bodyEditor = (
            <VSCodeTextArea
                readOnly={readOnly}
                rows={12}
                value={document.backup?.rawdata ?? ''}
                onKeyUp={(e) => {
                    textAreaChanged(e);
                }}
                onBlur={(e) => {
                    try {
                        let data = JSON.parse(document.backup.rawdata);
                        onChange([['data', data]]);
                    } catch (err) {
                        onError(err);
                    }
                }}
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
                    const ha = [...(document.headersArray ?? [])];
                    const ind = ha.findIndex(([, k]) => k === 'Content-Type');
                    const newRec = [UUID(), 'Content-Type', rawTypes[e.target.value][0], true, 'STRING'];
                    if (ind !== -1) ha.splice(ind, 1, newRec);
                    else ha.push(newRec);
                    onChange([
                        ['backup.bodySubType', e.target.value],
                        ['backup.bodyType', 'raw'],
                        ['headers.Content-Type', rawTypes[e.target.value][0]],
                        ['headersArray', ha],
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
    const ha = [...(document.headersArray ?? [])];
    const ind = ha.findIndex(([, k]) => k === 'Content-Type');

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
        const nbtype = toBodyType === 'form-data' ? 'multipart/form-data' : 'application/x-www-form-urlencoded';
        const newRec = [UUID(), 'Content-Type', nbtype, true, 'STRING'];
        if (ind !== -1) ha.splice(ind, 1, newRec);
        else ha.push(newRec);
        return [
            ['data', data],
            ['backup.bodySubType', bodySubType],
            ['backup.bodyType', toBodyType],
            ['backup.data', data],
            ['headers.Content-Type', nbtype],
            ['headersArray', ha],
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

        const newRec = [UUID(), 'Content-Type', rawTypes[bodySubType][0], true, 'STRING'];
        if (ind !== -1) ha.splice(ind, 1, newRec);
        else ha.push(newRec);
        return [
            ['headers.Content-Type', rawTypes[bodySubType][0]],
            ['backup.bodySubType', bodySubType],
            ['backup.bodyType', toBodyType],
            ['data', data],
            ['headersArray', ha],
        ];
    }
}
