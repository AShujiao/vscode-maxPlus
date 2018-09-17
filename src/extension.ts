'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { maxPlus } from './maxPlus';
import { maxDetailPanel } from './maxDetailPanel';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const maxPlusProvider = new maxPlus();

    vscode.window.registerTreeDataProvider('maxPlus',maxPlusProvider);
    vscode.commands.registerCommand('maxPlus.refreshEntry',() => maxPlusProvider.refresh());

    vscode.commands.registerCommand('maxPlus.detail',(url)=>{
        maxDetailPanel.createOrShow(url);
    })
}

// this method is called when your extension is deactivated
export function deactivate() {
}