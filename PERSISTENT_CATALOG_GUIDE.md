# 让 Excel Tutor 在本地 Excel 中长期可见

## 这和“自动旁加载”有什么不同？

`npm.cmd run start:desktop` 是开发测试方式。它会打开一个临时 Excel 工作簿，关闭该工作簿后，临时旁加载会话就结束了。

本机受信任加载项目录是持续方式：Excel 会从一个受信任的本机共享目录发现 `manifest.xml`。加载项被添加一次后，之后正常打开 Excel 工作簿时仍可找到它。

## 已在这台电脑完成的一次性配置

- 创建了仅含 `manifest.xml` 的目录：`catalog`。
- 将该目录共享为 `\\JAYSON‘S_BOOK\ExcelTutorCatalog`。
- 该共享只授予当前 Windows 用户读取权限；项目根目录和 `.env` 没有共享。
- 将该网络路径登记为当前 Windows 用户的 Excel 受信任加载项目录。

这些设置只对当前 Windows 用户、当前电脑有效。其他电脑需要各自部署，不能直接复制 `.env`。

## 第一次在 Excel 中添加

1. 先保存并关闭所有 Excel 窗口，再重新打开 Excel。
2. 打开任意工作簿，选择“主页 - 加载项 - 高级”。
3. 在 Office 加载项窗口顶部选择“共享文件夹”。
4. 找到 `Excel Tutor`，选择“添加”。
5. 功能区出现 `Excel Tutor` 后，点击 `Open Tutor`。

这一步只需执行一次。以后正常打开 Excel 时，加载项仍会存在；如果功能区没有立即显示，可在“主页 - 加载项”的列表中选择 Excel Tutor。

## 每次真正使用 AI 前

加载项目录保存的是加载项清单，但网页界面和 API 代理仍在本机运行。因此每次使用前，在项目目录运行：

```powershell
npm.cmd run dev
```

保持该 PowerShell 窗口打开，然后在 Excel 中点击 `Open Tutor`。不运行本地服务时，加载项可能仍显示在功能区，但任务窗格无法连接到网页和 AI 代理。

## 清单更新后怎么办？

如果修改了 `manifest.xml`，运行：

```powershell
npm.cmd run catalog:refresh
```

然后关闭 Excel、清除 Office 加载项缓存并重新打开 Excel。图标、Ribbon 或清单版本变更通常需要这一步；普通 React 页面代码变更通常只需要保持 `npm.cmd run dev` 运行。

## 安全边界

- `.env` 和 DeepSeek API Key 不会复制到 `catalog`，也不会通过共享目录暴露。
- 共享目录只包含 `manifest.xml`，它只包含本机 `https://localhost:5173` 地址和加载项配置。
- 这是一台电脑上的本地部署，不是公共网络发布。