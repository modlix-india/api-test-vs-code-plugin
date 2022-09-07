import { VSCodeButton, VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import React, { useCallback, useEffect, useState } from 'react';
import '@vscode/codicons/dist/codicon.css';

import { UUID } from '../util/uuid';
import { EditOnClick, EDITOR_TYPES } from './EditOnClick';

const firstColumn = {
    width: '55px',
    borderRight: '1px solid var(--divider-background)',
    minHeight: '26px',
    display: 'flex',
    alignItems: 'flex-start',
    padding: '3px 3px',
    gap: '3px',
};

const secondColumn = {
    flex: '1',
    borderRight: '1px solid var(--divider-background)',
    minHeight: '26px',
    display: 'flex',
    alignItems: 'flex-start',
    padding: '3px 3px',
};

const thirdColumn = {
    flex: '2',
    minHeight: '26px',
    display: 'flex',
    alignItems: 'center',
    padding: '3px 3px',
};

export function ParamsPanel(props) {
    const {
        readOnly,
        onChange,
        params,
        paramsArray,
        sectionName,
        arraySectionName,
        valueTypes = [EDITOR_TYPES.STRING],
    } = props;

    function deleteCallBack(k, id) {
        const newParams = { ...params };
        delete newParams[k];

        let newParamsArray = [...(paramsArray ?? [])];
        newParamsArray.splice(
            newParamsArray.findIndex(([oid]) => oid == id),
            1,
        );
        onChange([
            [sectionName, newParams],
            [arraySectionName, newParamsArray],
        ]);
    }

    function includeCallBack(e, k, id, v, valueType) {
        const newInclude = (e.target as HTMLInputElement).checked;
        const newParams = { ...params };
        if (!newInclude) delete newParams[k];
        else newParams[k] = v;
        let newParamsArray = [...(paramsArray ?? [])];
        newParamsArray.splice(
            newParamsArray.findIndex(([oid]) => oid == id),
            1,
            [id, k, v, newInclude, valueType],
        );
        onChange([
            [sectionName, newParams],
            [arraySectionName, newParamsArray],
        ]);
    }

    function keyChanged(id, k, key, v, include, valueType) {
        if (key === '' || key.trim() === '' || key === k) return;
        if (k === '') {
            onChange([
                [sectionName, { ...params, [key]: v }],
                [arraySectionName, [...(paramsArray ?? []), [id, key, v, include]]],
            ]);
            return;
        }
        const newParams = { ...params, [key]: v };
        delete newParams[k];
        let newParamsArray = [...(paramsArray ?? [])];
        newParamsArray.splice(
            newParamsArray.findIndex(([oid]) => oid == id),
            1,
            [id, key, v, include, valueType],
        );
        onChange([
            [sectionName, newParams],
            [arraySectionName, newParamsArray],
        ]);
    }

    function valueChanged(id, k, value, v, include, type) {
        if (value === v) return;
        if (value === '') value = undefined;

        const newParams = { ...params, [k]: value };
        let newParamsArray = [...(paramsArray ?? [])];
        newParamsArray.splice(
            newParamsArray.findIndex(([oid]) => oid == id),
            1,
            [id, k, value, include, type],
        );

        onChange([
            [sectionName, newParams],
            [arraySectionName, newParamsArray],
        ]);
    }

    const onError: (err: any) => void = props.onError ? props.onError : undefined;

    const rows: any[] = [];

    for (const [id, k, v, include, valueType = EDITOR_TYPES.STRING] of readOnly
        ? paramsArray ?? []
        : [...(paramsArray ?? []), [UUID(), '', '', true, EDITOR_TYPES.STRING]])
        rows.push(
            <div
                key={id}
                style={{ display: 'flex', flexDirection: 'row', border: '1px solid  var(--divider-background)' }}
            >
                <div style={firstColumn}>
                    {k === '' || readOnly ? (
                        <></>
                    ) : (
                        <>
                            <VSCodeButton
                                key={`${id}DeleteButton`}
                                onClick={() => deleteCallBack(k, id)}
                                appearance="icon"
                            >
                                <span className="codicon codicon-trash" />
                            </VSCodeButton>
                            <VSCodeCheckbox
                                key={`${id}CheckBox`}
                                checked={include}
                                onChange={(e) => includeCallBack(e, k, id, v, valueType)}
                            />
                        </>
                    )}
                </div>
                <div style={secondColumn}>
                    <EditOnClick
                        key={`${id}Key`}
                        readOnly={readOnly}
                        value={k}
                        onChange={(type: EDITOR_TYPES, key: any) => keyChanged(id, k, key, v, include, valueType)}
                        placeholder={'Key'}
                        valueType={EDITOR_TYPES.STRING}
                        valueTypes={[EDITOR_TYPES.STRING]}
                        onError={(e) => {
                            if (onError) onError(e);
                        }}
                    />
                </div>
                <div style={thirdColumn}>
                    <EditOnClick
                        key={`${id}Value`}
                        readOnly={readOnly || k === ''}
                        value={v}
                        onChange={(type: EDITOR_TYPES, value: any) => valueChanged(id, k, value, v, include, type)}
                        placeholder={'Value'}
                        valueTypes={valueTypes}
                        valueType={valueType}
                    />
                </div>
            </div>,
        );

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                flex: '1',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'row', border: '1px solid  var(--divider-background)' }}>
                <div style={firstColumn}></div>
                <div style={{ ...secondColumn, fontWeight: 'bold', alignItems: 'center' }}>
                    <span>KEY</span>
                </div>
                <div style={{ ...thirdColumn, fontWeight: 'bold' }}>
                    <span>VALUE</span>
                </div>
            </div>
            {rows}
        </div>
    );
}
