import * as vscode from 'vscode';
import * as path from 'path';
export class maxDetailPanel{

	public static currentPanel: maxDetailPanel | undefined;

	public static readonly viewType = 'maxDetail';

	private readonly _panel: vscode.WebviewPanel;
    private  _url: string;
    private _iconName:string;
    private _disposables: vscode.Disposable[] = [];

	public static createOrShow(url: string,iconName:string){
		const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;


		if(maxDetailPanel.currentPanel){
			maxDetailPanel.currentPanel._panel.reveal(column);
			maxDetailPanel.currentPanel._update(url,iconName);
			return;
		}

		const panel = vscode.window.createWebviewPanel(maxDetailPanel.viewType,"Max+ 资讯",column || vscode.ViewColumn.One,{
            enableScripts: true,
            retainContextWhenHidden:true,
            enableCommandUris:true
		});

		maxDetailPanel.currentPanel = new maxDetailPanel(panel,url,iconName);
	}


	private constructor(panel: vscode.WebviewPanel,url:string,iconName:string){
		this._panel = panel;
        this._url = url;
        this._iconName = iconName;
		// Set the webview's initial html content 
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update()
            }
        }, null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showErrorMessage(message.text);
                    return;
            }
        }, null, this._disposables);
	}

	public dispose() {
        maxDetailPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
	}

	private _update(url?:string,iconName?:string) {

        if(url) this._url = url;
        if(iconName) this._iconName = iconName;
        this._panel.title = "Max+ 资讯";

        this._panel.iconPath = {
            light:vscode.Uri.file(path.join(__filename,  '..', '..', 'resources', 'light', this._iconName + '.svg')) ,
            dark: vscode.Uri.file(path.join(__filename,  '..', '..', 'resources', 'dark', this._iconName + '.svg'))
        };
        this._panel.webview.html = this._getHtmlForWebview();
	}
	
	private _getHtmlForWebview() {

        let config = vscode.workspace.getConfiguration('maxPlus'); // 当前用户配置
        this._url += (config.NewsComment ? '':'?version=4.2.9');

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" >
                <title>Max</title>
            </head>
            <body>
            
                <iframe width="480" height="800" style="width:480px;height:800px;" src="${this._url}" ></iframe>
            </body>
            </html>`;
    }

}