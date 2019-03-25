import * as vscode from 'vscode';
import * as path from 'path';
export class maxDetailPanel{
    //面板
    public static currentPanel: maxDetailPanel | undefined;
    //面板类型
    public static readonly viewType = 'maxDetail';
    //webView
    private readonly _panel: vscode.WebviewPanel;
    //请求url
    private  _url: string;
    //图标名称
    private _iconName:string;
    //监听面板事件
    private _disposables: vscode.Disposable[] = [];

    /**
     *创建面板
    * @static
    * @param {string} url url地址
    * @param {string} iconName 游戏图标
    * @returns
    * @memberof maxDetailPanel
    */
    public static createOrShow(url:string,iconName:string){
        //面板列值
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        //存在则直接更新
		if(maxDetailPanel.currentPanel){
			maxDetailPanel.currentPanel._panel.reveal(column);
			maxDetailPanel.currentPanel._update(url,iconName);
			return;
        }
        //创建面板
		const panel = vscode.window.createWebviewPanel(maxDetailPanel.viewType,"Max+ 资讯",column || vscode.ViewColumn.One,{
            enableScripts: true,
            retainContextWhenHidden:true,
            enableCommandUris:true
		});

		maxDetailPanel.currentPanel = new maxDetailPanel(panel,url,iconName);
	}


    //初始化
	private constructor(panel: vscode.WebviewPanel,url:string,iconName:string){
		this._panel = panel;
        this._url = url;
        this._iconName = iconName;
		// 初始化文档内容
        this._update();

        // 监听关闭面板事件
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // 更新内容事件，暂时用不到
        // this._panel.onDidChangeViewState(e => {
        //     if (this._panel.visible) {
        //         this._update()
        //     }
        // }, null, this._disposables);

        // 处理面板中的消息，暂时用不到
        /*this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showErrorMessage(message.text);
                    return;
            }
        }, null, this._disposables);*/
	}
    //关闭面板，释放资源
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
    /**
     * 更新数据
     * @private
     * @param {string} [url] 访问的url
     * @param {string} [iconName] 游戏图标
     * @memberof maxDetailPanel
     */
    private _update(url?:string,iconName?:string) {

        if(url) this._url = url;
        if(iconName) this._iconName = iconName;
        //设置面板标题
        this._panel.title = "Max+ 资讯";
        // 设置面板图标
        this._panel.iconPath = {
            light:vscode.Uri.file(path.join(__filename,  '..', '..', 'resources', 'light', this._iconName + '.svg')) ,
            dark: vscode.Uri.file(path.join(__filename,  '..', '..', 'resources', 'dark', this._iconName + '.svg'))
        };
        //更新html
        this._panel.webview.html = this._getHtmlForWebview();
    }
    
	/**
     * 生成html
     * @private
     * @returns
     * @memberof maxDetailPanel
     */
    private _getHtmlForWebview() {
        let config = vscode.workspace.getConfiguration('maxPlus'); // 当前用户配置
        this._url += (config.NewsComment ? '':'&version=4.2.9');

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