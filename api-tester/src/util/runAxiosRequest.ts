import axios from 'axios';
import { readFile } from 'fs';
import path = require('path');

export function runAxiosRequest(
    document: any,
    environment: string,
    workspace: string | undefined,
    callback: (data: any, error?: any) => void,
) {
    const request = JSON.parse(JSON.stringify(document));

    delete request.paramsArray;
    delete request.headersArray;
    delete request.backup;

    if (workspace) {
        readFile(path.resolve(workspace, 'global.var'), 'utf8', (gerr, gdata) => {
            let vars = {};
            if (!gerr) {
                try {
                    vars = JSON.parse(gdata).variables;
                } catch (error) {}
            }
            if (environment) {
                readFile(path.resolve(workspace, environment), 'utf8', (eerr, edata) => {
                    if (!eerr) {
                        try {
                            vars = { ...vars, ...JSON.parse(edata).variables };
                        } catch (error) {}
                    }
                    try {
                        const processed = processVariables(vars, request);
                        axios(processed).then(
                            (response) => callback(response),
                            (reason) => callback(reason),
                        );
                    } catch (error) {
                        callback(undefined, error);
                    }
                });
            } else {
                try {
                    const processed = processVariables(vars, request);

                    axios(processed).then(
                        (response) => callback(response),
                        (reason) => callback(reason),
                    );
                } catch (error) {
                    callback(undefined, error);
                }
            }
        });
    } else {
        axios(request).then(
            (response) => callback(response),
            (reason) => callback(reason),
        );
    }
}

function processVariables(vars: any, object: any): any {
    if (Array.isArray(object)) {
        return object.map((e) => processVariables(vars, object));
    }

    const typ = typeof object;

    if (typ === 'object') {
        return Object.entries(object).reduce((a: any, [k, v]) => {
            a[processVariables(vars, k as any)] = processVariables(vars, v);
            return a;
        }, {});
    } else if (typ === 'string') {
        const fvars = new Set<string>();
        let fromInd = 0;
        let bracketStart = -1;
        while ((bracketStart = object.indexOf('{{', fromInd)) !== -1) {
            if (bracketStart !== 0 && typ[bracketStart - 1] === '\\') {
                fromInd = bracketStart + 2;
                continue;
            }
            fromInd = object.indexOf('}}', bracketStart);
            if (fromInd === -1) {
                break;
            }
            fvars.add(object.substring(bracketStart + 2, fromInd));
        }

        const fvarvalues = Array.from(fvars);
        if (fvarvalues.length === 1) {
            const value = vars[fvarvalues[0]];
            if (!value) {
                throw new Error(`Unable to find value for the variable '${fvarvalues[0]}'`);
            }
            if (fvarvalues[0].length + 4 === object.length) {
                return value;
            }
            return (object as string).replace(new RegExp(`{{${fvarvalues[0]}}}`, 'g'), value);
        } else {
            return fvarvalues.reduce((a: string, c) => {
                const value = vars[c];
                if (!value) {
                    throw new Error(`Unable to find value for the variable '${c}'`);
                }
                return a.replace(new RegExp(`{{${c}}}`, 'g'), value);
            }, object as string);
        }
    }

    return object;
}
