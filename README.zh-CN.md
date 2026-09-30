# French Digest：法语视频学习插件

这是一个独立的 Chrome 扩展，用带法语字幕的 YouTube 视频学习法语。它提供法语逐字稿、中文翻译、法中对照、章节概览、词句讲解、笔记和生词本。

## 目录

- [主要功能](#features)
- [与原版并排安装](#install)
- [配置 API 密钥](#api-keys)
- [学习流程](#study)
- [数据与限制](#data-and-limits)

<a id="features"></a>
## 主要功能

- 优先获取带时间戳的法语原生字幕，点击时间戳可跳转视频。
- 可切换法语原文、简体中文译文和法中对照。
- 打开 Overview 时生成法语章节摘要和适合学习的原文例句。
- 选中词句可获取中文释义，以及相关的语法或用法提示。
- 保存笔记和生词；已保存的词会在后续逐字稿中高亮。
- 与原版 YouTube Digest 使用不同扩展身份、独立的 Chrome 本地存储和不同的页面按钮。

<a id="install"></a>
## 与原版并排安装

1. 将本文件夹长期保存在固定位置，例如 `/Users/chengxinzhi/youtube-digest-french`。
2. 在 Chrome 打开 `chrome://extensions`，开启“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择包含 `manifest.json` 的本文件夹。
4. 确认列表中出现独立的 **French Digest**；原版 YouTube Digest 可以继续保留。
5. 修改代码后，在 French Digest 卡片点击“重新加载”，并刷新已打开的 YouTube 页面。

法语版的页面按钮是蓝色 **Français**。它不注册页面键盘快捷键，避免和原版的 `D`、`N` 冲突。

<a id="api-keys"></a>
## 配置 API 密钥

打开 French Digest 的 **Settings**，分别填写自己的 Supadata 和 DeepSeek API 密钥。两个扩展的设置独立，因此原版中的密钥不会自动复制过来。

- [Supadata 控制台](https://dash.supadata.ai/)：获取字幕 API 密钥。
- [DeepSeek API Keys](https://platform.deepseek.com/api_keys)：获取翻译、概览、讲解和笔记整理使用的 AI 密钥。

请只在扩展设置页输入密钥，不要写进源码。调用服务可能按你自己的账号计费。

<a id="study"></a>
## 学习流程

1. 打开有法语字幕的 YouTube 视频，点击播放器下方的 **Français** 或扩展图标。
2. 阅读、搜索 Transcript，并在 **Français / 中文 / 法中对照** 之间切换。
3. 打开 Overview 查看法语章节摘要和例句。首次生成需要等待并消耗 AI token。
4. 选中法语词句，点 **Explain** 看中文解释，或点 **Save word** 加入生词本。
5. 点击时间戳回到视频对应位置。

如果 Supadata 明确返回非法语字幕，插件会停止并提示更换视频。如果服务没有报告字幕语言，插件会显示返回内容，但无法保证语言。

<a id="data-and-limits"></a>
## 数据与限制

逐字稿和学习记录保存在此扩展的 Chrome 本地存储中。抓取字幕时会向 Supadata 发送规范化的视频链接；翻译和分析会把相关文本发送给 DeepSeek。插件没有开发者运营的服务器或分析埋点。参见 [隐私说明](PRIVACY.md) 和 [安全说明](SECURITY.md)。

插件只读取已有字幕，不做语音转写。字幕质量和 AI 讲解可能有误，重要语言知识请结合原视频与可靠词典核对。
