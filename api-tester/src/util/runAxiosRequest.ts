import axios from 'axios';
import { readFile } from 'fs';
import path = require('path');

export function runAxiosRequest(
    document: any,
    environment: string,
    workspace: string | undefined,
    callback: (data: any) => void,
) {
    const request = JSON.parse(JSON.stringify(document));

    delete request.paramsArray;
    delete request.headersArray;
    delete request.backup;

    if (environment !== '' && workspace) {
        readFile(path.resolve(workspace, 'global.var'), 'utf8', (gerr, gdata) => {
            let vars = {};
            if (!gerr) {
                try {
                    vars = JSON.parse(gdata);
                } catch (error) {}
            }

            readFile(path.resolve(workspace, environment), 'utf8', (eerr, edata) => {
                if (!eerr) {
                    try {
                        vars = { ...vars, ...JSON.parse(edata) };
                    } catch (error) {}
                }

                console.log('Variables...', vars);
            });
        });
    } else {
        axios(request).then(
            (response) => callback(response),
            (reason) => callback(reason),
        );
    }
}
