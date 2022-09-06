import * as vscode from 'vscode';
import { APITestEditorProvider } from './editors/APITestEditorProvider';
import { VARTestEditorProvider } from './editors/VARTestEditorProvider';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(APITestEditorProvider.register(context));
    context.subscriptions.push(VARTestEditorProvider.register(context));
}
export function deactivate() {}
