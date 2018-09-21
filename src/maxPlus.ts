import * as vscode from 'vscode';
import * as path from 'path';
import * as http from 'http';

export class maxPlus implements vscode.TreeDataProvider<Dependency>{
	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined> = new vscode.EventEmitter<Dependency | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this._onDidChangeTreeData.event;
	private _gameType:string = vscode.workspace.getConfiguration("maxPlus").DefaultGame;

	constructor() {

	}

	refresh(gaemType?:string): void {
		if(gaemType){
			this._gameType = gaemType;
		}
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency) {
		return this.getMaxJson();
	}

	async  getMaxJson() {
		let re = await this.requestOrderAPI();
		return Promise.resolve(this.getMaxPlusData(re));
	}


	private requestOrderAPI() {
		let url: string = "http://news.maxjia.com/maxnews/app/list?game_type="+this._gameType+"&imei=354702090309389&os_type=Android&os_version=8.0.0&version=4.2.9&lang=zh-cn";
		let re: string = '';
		return new Promise(function (resolve, reject) {
			http.get(url, (res) => {
				res.setEncoding('utf8');
				let rawData = '';
				res.on('data', function (chunk) {
					rawData += chunk;
				});
				res.on('end', () => {
					resolve(rawData);
				});
			});
		});
	}


	private getMaxPlusData(data: any): Dependency[] {

		if (data == "") return [];

		const maxJson = JSON.parse(data);

		if (typeof maxJson != 'object' && !maxJson) {
			return [];
		}

		if (maxJson.result.length <= 0) {
			return [];
		}
		
		const toDep = (title: string, url: string): Dependency => {
			return new Dependency(title, vscode.TreeItemCollapsibleState.None, {
				command: "maxPlus.detail",
				title: '',
				arguments: [url]
			});
		}
		
		let list = Object.keys(maxJson.result).map(dep => toDep(
			maxJson.result[dep]['title'], 
			maxJson.result[dep]['newUrl']
		));

		return list;
	}

}

class Dependency extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return this.label;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';
}
