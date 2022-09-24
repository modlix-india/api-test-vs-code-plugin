import axios from 'axios';
import { readFile } from 'fs';
import path = require('path');

export function runAxiosRequest(
    document: any,
    environment: string,
    settings: any,
    outChannel: any,
    workspace: string | undefined,
    after: (data: any, time: number, error?: any) => void,
) {
    const request = JSON.parse(JSON.stringify(document));

    function callback(cData: any, cTime: number, cError?: any) {
        if (document?.backup?.postScript) {
            try {
                const fun = new Function('settings', 'console', 'response', document.backup.postScript);
                fun(
                    settings,
                    {
                        log: function () {
                            for (let i = 0; i < arguments.length; i++) {
                                let m = arguments[i];
                                if (typeof arguments[i] === 'object') {
                                    try {
                                        m = JSON.stringify(arguments[i]);
                                    } catch (err) {}
                                }
                                outChannel.appendLine(m);
                            }
                        },
                    },
                    cData,
                );
            } catch (err) {
                cError = err;
            }
        }

        after(cData, cTime, cError);
    }

    delete request.paramsArray;
    delete request.headersArray;
    delete request.backup;

    if (!request.method) {
        request.method = 'get';
    }

    const start = new Date().getTime();
    if (workspace) {
        readFile(path.resolve(workspace, 'global.var'), 'utf8', (gerr, gdata) => {
            let vars = Object.entries(settings.settings ?? {}).reduce((a: any, [k, v]: [string, any]) => {
                a['settings.' + k] = v;
                return a;
            }, {});

            if (!gerr) {
                try {
                    vars = { ...vars, ...JSON.parse(gdata).variables };
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
                            (response) => callback(response, new Date().getTime() - start),
                            (reason) => callback(reason, new Date().getTime() - start),
                        );
                    } catch (error) {
                        callback(undefined, new Date().getTime() - start, error);
                    }
                });
            } else {
                try {
                    const processed = processVariables(vars, request);

                    axios(processed).then(
                        (response) => callback(response, new Date().getTime() - start),
                        (reason) => callback(reason, new Date().getTime() - start),
                    );
                } catch (error) {
                    callback(undefined, new Date().getTime() - start, error);
                }
            }
        });
    } else {
        axios(request).then(
            (response) => callback(response, new Date().getTime() - start),
            (reason) => callback(reason, new Date().getTime() - start),
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
