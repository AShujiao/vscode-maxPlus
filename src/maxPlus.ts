import * as vscode from 'vscode';
import * as path from 'path';
import * as https from 'https';
import { URLSearchParams } from 'url';

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
			case "dota2":
			blackGameType = 'dota2';
			break;
			case "csgo":
			blackGameType = 'csgo';
			break;
			case "hs":
			blackGameType = 'hs';
			break;
			case "lol":
			blackGameType = 'lol';
			break;
			case "pubg":
			blackGameType = 'PUBG';
			break;
		}
		
		// 构建查询参数
		const params = new URLSearchParams({
			heybox_id: '92539373',
			time_zone: 'Asia/Shanghai',
			hkey: 'fea42e64',
			x_app: 'heybox',
			os_version: '26.1',
			netmode: 'wifi',
			device_id: '3792C67E-3786-4074-8BE7-2D9D79D64ED6',
			nonce: 'nqq9nYWvIhj45bIJcPbugnBWwwchXCWJ',
			x_client_type: 'mobile',
			device_info: 'iPhone12',
			lang: 'zh-cn',
			x_os_type: 'iOS',
			os_type: 'iOS',
			_time: '1766142160',
			_rnd: '14:6DD9BCF7',
			dw: '390',
			version: '1.3.375',
			lastval: '',
			tag: blackGameType,
			list_ver: '2',
			limit: '20',
			offset: '0',
			is_first: '1'
		});

		let path: string = "/bbs/app/feeds/news?" + params.toString();
		
		let option = {
			protocol: 'https:',
			host: "api.xiaoheihe.cn",
			method: 'GET',
			path: path,
			timeout: 5000,
			rejectUnauthorized: false,
			headers: {
				'Host': 'api.xiaoheihe.cn',
				'Accept-Encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
				'Accept': '*/*',
				'Connection': 'keep-alive',
				'baggage': 'sentry-environment=production,sentry-public_key=cd2481795348588c5ea1fe1284a27c0b,sentry-release=com.max.xiaoheihe%401.3.375%2B1653,sentry-sample_rand=0.792476,sentry-sample_rate=0.010000,sentry-sampled=false,sentry-trace_id=c3ebfe68d73b4fb4ae505a8fa633cec4,sentry-transaction=HB5FeedsListViewController',
				'Cookie': 'pkey=MTc2NjEzNDI1OS40OV85MjUzOTM3M2tvaGd2a3doZG5heHZ2Z2I__;hkey=77f79247dfe4061b8ce62f996392ada4;x_xhh_tokenid=BlCY+sctifBQjWac4BhFLbDSaLvK9d8iHN34lyDhomMP/k6R/bsQSpNQdw2G7UsiQLNzBN8JGGpmOhpeA6F8QVQ==',
				'User-Agent': 'xiaoheihe/1.3.375 (com.max.xiaoheihe; build:1653; iOS 26.1.0) Alamofire/5.9.0',
				'Accept-Language': 'zh-Hans-US;q=1.0',
				'Referer': 'http://api.maxjia.com/',
				'sentry-trace': 'c3ebfe68d73b4fb4ae505a8fa633cec4-796b945a35144811-0'
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
			case "dota2":
			this._iconName = "dota";
			break;
			case "csgo":
			this._iconName="csgo";
			break;
			case "hs":
			this._iconName="Hearthstone";
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
				.filter((item: any) => item.link_id && item.title)
				.map((item: any) => {
					const url = `https://api.xiaoheihe.cn/v3/bbs/app/api/web/share?link_id=${item.link_id}`;
					return toDep(item.title, url, item.link_id);
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
