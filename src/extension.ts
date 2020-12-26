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
    vscode.commands.registerCommand('maxPlus.switch-ow',() => maxPlusProvider.refresh("ow"));
    vscode.commands.registerCommand('maxPlus.switch-dota',() => maxPlusProvider.refresh("dota2"));
    vscode.commands.registerCommand('maxPlus.switch-csgo',() => maxPlusProvider.refresh("csgo"));
    vscode.commands.registerCommand('maxPlus.switch-hs',() => maxPlusProvider.refresh("hs"));
    vscode.commands.registerCommand('maxPlus.switch-lol',() => maxPlusProvider.refresh("lol"));
    vscode.commands.registerCommand('maxPlus.switch-pubg',() => maxPlusProvider.refresh("pubg"));
    vscode.commands.registerCommand('maxPlus.prePage',() => maxPlusProvider.refresh(undefined,"pre"));
    vscode.commands.registerCommand('maxPlus.nextPage',() => maxPlusProvider.refresh(undefined,"next"));

    vscode.commands.registerCommand('maxPlus.detail',(url,iconName)=>{
        maxDetailPanel.createOrShow(url,iconName);
    })
    // 首次打开-提示语
    let openNum:string           = context.globalState.get('ext_version');
    let ex:vscode.Extension<any> = vscode.extensions.getExtension('manasxx.max');
    let version:string           = ex.packageJSON['version'];
    if(openNum != version && ex.packageJSON['one_title']){
        context.globalState.update('ext_version',version);
        vscode.window.showInformationMessage("本次更新：使用https请求接口（http 301）");
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}