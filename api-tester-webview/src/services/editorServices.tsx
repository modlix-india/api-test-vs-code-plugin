import makeDataObject from './setDataService';

const MSG_TYP_ERROR = 'error';
const MSG_TYP_DOCCHANGE = 'docchange';
const MSG_TYP_SEND = 'send';
const MSG_TYP_ENVCHANGE = 'envchange';

export function onHttpMethodChange(newMethod: string, json: any, vscode: any): any {
    json = duplicate(json);
    json.method = newMethod;
    vscode.postMessage({
        type: MSG_TYP_DOCCHANGE,
        document: json,
    });

    return json;
}

export function onUrlChange(newUrl: string, json: any, vscode: any): any {
    json = duplicate(json);
    json.url = newUrl;

    vscode.postMessage({
        type: MSG_TYP_DOCCHANGE,
        document: json,
    });
    return json;
}

export function onError(err: any, vscode: any) {
    vscode.postMessage({
        type: MSG_TYP_ERROR,
        error: { name: err.name, message: err.message, fullString: '' + err },
    });
}

export function onSend(json: any, currentEnvironment: string, vscode: any) {
    vscode.postMessage({
        type: MSG_TYP_SEND,
        document: json,
        environment: currentEnvironment,
    });
}

export function onDocumentChange(sectionValues: [[key: string, value: any | undefined]], json: any, vscode: any): any {
    json = duplicate(json);
    for (const [section, value] of sectionValues) {
        makeDataObject(json, section, value);
    }
    vscode.postMessage({
        type: MSG_TYP_DOCCHANGE,
        document: json,
    });
    return json;
}

export function onChangeEnvironment(env: string, vscode: any) {
    vscode.postMessage({
        type: MSG_TYP_ENVCHANGE,
        environment: env,
    });
}

function duplicate(json: any): any {
    return JSON.parse(JSON.stringify(json));
}
