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
        const scriptPathOnDisk = vscode.Uri.file(path.join(__filename,  '..', '..', 'resources', 'test.js'));
        const mp3url = vscode.Uri.file(path.join("https://m10.music.126.net/20181018173634/ba48c08e231a1609c3c8ee25b20d2292/ymusic/e33e/ce89/f6b0/03021c4140edc953808280ac78bd35be.mp3"));

        // And the uri we use to load this script in the webview
        const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
        const mpe3url2 = mp3url.with({ scheme: 'vscode-resource' });

        const nonce = this.getNonce();

        let config = vscode.workspace.getConfiguration('maxPlus'); // 当前用户配置
        this._url += (config.NewsComment ? '':'?version=4.2.9');
        let jsPath = vscode.Uri.file(path.join(__filename,  '..', '..', 'resources', 'test.js'));
        //this._url = "https://www.iesdouyin.com/share/video/6612399950728793348/?region=CN&mid=6612399998971677453&u_code=klfckggj&titleType=title&timestamp=1539575933";
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-ab123';frame-src https:; media-src https:;">
                

                <meta name="viewport" >
                <title>Max</title>
            </head>
            <body>
            <audio nonce="abc123" src="https://m10.music.126.net/20181018173634/ba48c08e231a1609c3c8ee25b20d2292/ymusic/e33e/ce89/f6b0/03021c4140edc953808280ac78bd35be.mp3">
                您的浏览器不支持 audio 标签。
            </audio>
                <iframe style="width:480px;height:800px;" src="${this._url}" ></iframe>
                <script nonce="ab123" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    private getNonce() {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
	

}