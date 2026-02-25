import * as vscode from 'vscode';
import * as path from 'path';
import * as https from 'https';
import { URLSearchParams } from 'url';
import { computeHkey, generateNonce } from './xiaoheihe-sign';

export class maxPlus implements vscode.TreeDataProvider<Dependency>{
	//默认事件
	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined> = new vscode.EventEmitter<Dependency | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this._onDidChangeTreeData.event;
	//游戏类型
	private _gameType:string = vscode.workspace.getConfiguration("maxPlus").DefaultGame;
	//游戏图标
	private _iconName:string;
	//当前页数
	private _page:number = 0;
	//每页展示条数
	private _limit:number = 30;

	constructor() {

	}

	//更新列表数据
	refresh(gaemType?:string,pageType?:string): void {

		//改变页数
		pageType == "pre"  && this._page--;
		pageType == "next" && this._page++;
		//是否小于0
		if(this._page < 0){
			this._page = 0;
			vscode.window.showInformationMessage('不能再翻页了，已经到第一页了！(*^▽^*)');
			return;
		}
		//是否切换游戏
		if(gaemType && gaemType != this._gameType){
			this._gameType = gaemType;
			this._page = 0;//切换游戏后默认为第一页数据
		}
		
		//更新列表
		this._onDidChangeTreeData.fire();
	}
	//获取列表数据展示
	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	//获取数据
	getChildren(element?: Dependency) {
		return this.getMaxJson();
	}

	//异步请求
	async  getMaxJson() {
		let re = await this.requestOrderAPI();
		return Promise.resolve(this.getMaxPlusData(re));
	}

	//请求url json数据
	private requestOrderAPI() {
		//根据游戏类型适配小黑盒
		let blackGameType:string = '';
		switch(this._gameType){
			case "ow":
			blackGameType = 'overwatchtwo';
			break;
			case "sjz": // 三角洲
			blackGameType = 'topic_611472';
			break;
			case "csgo":
			blackGameType = 'csgo';
			break;
			case "apex": // APEX
			blackGameType = 'APEX';
			break;
			case "lol":
			blackGameType = 'lol';
			break;
			case "pubg":
			blackGameType = 'PUBG';
			break;
		}

		// 生成签名参数
		const ts = Math.floor(Date.now() / 1000);
		const apiPath = '/bbs/app/feeds/news';
		const signPath = apiPath.endsWith('/') ? apiPath : apiPath + '/';
		const hkey = computeHkey(signPath, ts, '054ec0ee9649217b-1');
		const nonce = generateNonce();

		// 构建查询参数
		const params = new URLSearchParams({
			heybox_id: '-1',
			imei: '054ec0ee9649217b',
			device_info: 'Android',
			nonce: nonce,
			hkey: hkey,
			os_type: 'Android',
			x_os_type: 'Android',
			x_client_type: 'mobile',
			os_version: '9',
			version: '1.3.347',
			build: '916',
			_time: ts.toString(),
			dw: '411',
			channel: 'heybox_google',
			x_app: 'heybox',
			time_zone: 'Asia/Shanghai',
			netmode: 'wifi',
			offset: (this._page * this._limit).toString(),
			limit: this._limit.toString(),
			tag: blackGameType,
			rec_mark: 'tags',
			is_first: this._page === 0 ? '1' : '0'
		});

		let requestPath: string = apiPath + "?" + params.toString();

		let option = {
			protocol: 'https:',
			host: "api.xiaoheihe.cn",
			method: 'GET',
			path: requestPath,
			timeout: 10000,
			rejectUnauthorized: false,
			headers: {
				'User-Agent': 'okhttp/4.9.1'
			}
		}
		return new Promise(function (resolve, reject) {
			const req = https.get(option, (res) => {
				res.setEncoding('utf8');
				let rawData = '';
				res.on('data', function (chunk) {
					rawData += chunk;
				});
				res.on('end', () => {
					resolve(rawData);
				});
			});
			req.on('error', (e) => {
				reject(e);
			});
			req.on('timeout', () => {
				reject(new Error('请求超时'));
			});
		});
	}


	//处理数据添加到集合内
	private getMaxPlusData(data: any): Dependency[] {
		if (data == "") return [];
		const maxJson = JSON.parse(data);
		//检测数据
		if ((typeof maxJson != 'object' && !maxJson) || (!maxJson.result) || (maxJson.result.links && maxJson.result.links.length <= 0)) {
			vscode.window.showInformationMessage('好像没有数据了！(*^▽^*)');
			return [];
		}
		//根据游戏类型分配图标
		switch(this._gameType){
			case "ow":
			this._iconName = "Overwatch";
			break;
			case "sjz":
			this._iconName = "sjz";
			break;
			case "csgo":
			this._iconName="csgo";
			break;
			case "apex":
			this._iconName="apex";
			break;
			case "lol":
			this._iconName="lol";
			break;
			case "pubg":
			this._iconName="pubg";
			break;
		}
		//处理数据
		const toDep = (title: string, url: string, linkId?: number): Dependency => {
			return new Dependency(title, vscode.TreeItemCollapsibleState.None,this._iconName, {
				command: "maxPlus.detail",
				title: '',
				arguments: [url,this._iconName]
			});
		}
		//循环添加数据
		let list: Dependency[] = [];
		if (maxJson.result.links) {
			list = maxJson.result.links
				.filter((item: any) => item.linkid && item.title)
				.map((item: any) => {
					const url = `https://api.xiaoheihe.cn/v3/bbs/app/api/web/share?link_id=${item.linkid}`;
					return toDep(item.title, url, item.linkid);
				});
		}
		return list;
	}

}

//列表类
class Dependency extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public iconName:string,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.tooltip = this.label;
	}

	iconPath = {
		light: path.join(__filename,  '..', '..', 'resources', 'light', this.iconName + '.svg'),
		dark: path.join(__filename,  '..', '..', 'resources', 'dark', this.iconName + '.svg')
	};

	contextValue = 'dependency';
}
