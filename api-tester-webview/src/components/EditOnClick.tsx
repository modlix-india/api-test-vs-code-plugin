import {
    VSCodeCheckbox,
    VSCodeDropdown,
    VSCodeOption,
    VSCodeTextArea,
    VSCodeTextField,
} from '@vscode/webview-ui-toolkit/react';
import React, { useCallback, useEffect, useState } from 'react';
import { deepEqual } from '../util/deepEqual';

export enum EDITOR_TYPES {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    JSON = 'JSON',
}

function getValueByType(vt, v, onError) {
    if (vt === EDITOR_TYPES.STRING) {
        v = '' + v;
    } else if (vt === EDITOR_TYPES.NUMBER) {
        v = parseInt(v);
        if (isNaN(v)) v = 0;
    } else if (vt === EDITOR_TYPES.BOOLEAN) {
        v = v === true || ('' + v).toUpperCase() === 'TRUE' || ('' + v).toUpperCase() === 'YES';
    } else if (vt === EDITOR_TYPES.JSON) {
        try {
            if (typeof v !== 'object') v = JSON.parse(v);
        } catch (err) {
            onError(err);
        }
    }
    return v;
}

export function EditOnClick(props) {
    const {
        readOnly,
        value,
        onChange,
        placeholder,
        valueType = EDITOR_TYPES.STRING,
        valueTypes = [EDITOR_TYPES.STRING],
    } = props;

    const onError: (err: any) => void = props.onError ? props.onError : undefined;

    // const [value, setValue] = useState(inValue);

    // useEffect(() => {
    //     if (deepEqual(value, inValue)) return;
    //     setValue(inValue);
    // }, [inValue]);

    // useEffect(() => {
    //     const handle = setTimeout(() => {
    //         let v = getValueByType(valueType, value, onError);
    //         if (deepEqual(v, inValue)) return;
    //         onChange(valueType, v);
    //     }, 200);

    //     return () => clearTimeout(handle);
    // }, [value]);

    function onChangeCallBack(v) {
        v = getValueByType(valueType, v, onError);
        if (deepEqual(v, value)) return;
        onChange(valueType, v);
    }

    function onTypeChangeCallBack(vt) {
        if (vt === valueType) return;
        onChange(vt, getValueByType(vt, value, onError));
    }

    let valueTypesEditor = <></>;
    if (valueTypes.length > 1) {
        valueTypesEditor = (
            <VSCodeDropdown
                value={valueType}
                onChange={(e) => onTypeChangeCallBack(e.target.value as EDITOR_TYPES)}
                disabled={readOnly}
            >
                {Object.keys(EDITOR_TYPES)
                    .filter((v) => isNaN(Number(v)))
                    .map((e) => (
                        <VSCodeOption key={e} label={e} value={e}>
                            {e}
                        </VSCodeOption>
                    ))}
            </VSCodeDropdown>
        );
    }

    let valueEditor = <></>;
    if (valueType === EDITOR_TYPES.BOOLEAN) {
        valueEditor = (
            <VSCodeCheckbox
                readOnly={readOnly}
                autofocus={true}
                checked={value}
                onChange={(e) => {
                    const val = (e.target as HTMLInputElement).checked;
                    onChangeCallBack(val);
                }}
            />
        );
    } else if (valueType === EDITOR_TYPES.JSON) {
        valueEditor = (
            <VSCodeTextArea
                readOnly={readOnly}
                autofocus={true}
                value={typeof value === 'object' && value ? JSON.stringify(value, undefined, 2) : value}
                placeholder={placeholder}
                rows={8}
                style={{ flex: 1 }}
                onKeyUp={(e) => onChangeCallBack((e.target as HTMLInputElement).value)}
            ></VSCodeTextArea>
        );
    } else if (readOnly) {
        valueEditor = <span>{value ?? placeholder}</span>;
    } else {
        valueEditor = (
            <VSCodeTextField
                readOnly={readOnly}
                autofocus={true}
                value={value}
                placeholder={placeholder}
                style={{ flex: '1' }}
                onKeyUp={(e) => onChangeCallBack((e.target as HTMLInputElement).value)}
            />
        );
    }

    return (
        <div style={{ flex: '1', display: 'flex', flexDirection: 'row', gap: '3px' }}>
            {valueTypesEditor}
            {valueEditor}
        </div>
    );
}
