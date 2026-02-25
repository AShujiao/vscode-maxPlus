# 小黑盒游戏资讯

一个可以在 VS Code 中阅读小黑盒游戏资讯的扩展插件。

## 功能特性

支持以下游戏资讯：
- 守望先锋
- 三角洲行动
- CS:GO
- APEX 英雄
- 英雄联盟
- 绝地求生

安装后可从侧边栏打开，点击顶部图标切换不同游戏的资讯。

![效果](https://user-images.githubusercontent.com/14969576/62412872-d3d7bb80-b63a-11e9-9211-0cf9b9ac58bc.gif)
![效果](https://user-images.githubusercontent.com/14969576/62412870-cd494400-b63a-11e9-9b55-beeca840d76c.jpg)

## 使用要求

需要网络连接。

## 扩展设置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| ~~`maxPlus.NewsComment`~~ | ~~资讯详情页是否显示评论~~ （已弃用） | `false` |
| `maxPlus.DefaultGame` | 首次打开时加载的游戏类型 | `ow` |

## 更新日志

#### v1.5.0 (2026/02/26)
- 实现 API 签名算法，恢复扩展功能
- 新增三角洲行动、APEX 英雄游戏资讯

#### v1.4.2 (2020/12/26)
- 改用 HTTPS 请求接口

#### v1.4.1 (2020/11/24)
- 使用分享页详情链接

#### v1.4.0 (2019/08/03)
- 添加英雄联盟、绝地求生游戏资讯

#### v1.3.0 (2019/05/13)
- 改用小黑盒 APP 接口

## 相关链接

- [GitHub](https://github.com/AShujiao/vscode-maxPlus)
- [问题反馈](https://github.com/AShujiao/vscode-maxPlus/issues)

## 注意事项

由于 VS Code 的限制，资讯中的视频无声音。

**Enjoy!**
