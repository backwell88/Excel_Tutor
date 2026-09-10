# Excel Tutor：桌面 Excel 接入排障复盘

> 这是一份给项目使用者看的记录。它解释今天为什么网页端正常、桌面 Excel 却连续报错，以及最终如何让加载项在本地 Excel 中稳定使用。

## 1. 先说结论

Excel Tutor 不是传统的 `.xlam` 宏加载项，而是 **Office Web Add-in（Office 网页加载项）**。

它由两部分组成：

```text
Excel 桌面客户端
  └─ 读取 manifest.xml（加载项说明书）
       └─ 在 https://localhost:5173 打开网页任务窗格
            └─ 调用本机 http://127.0.0.1:3001 代理
                 └─ 代理从 .env 读取 DeepSeek API Key
```

因此，桌面 Excel 能否使用它，取决于以下四件事：

1. Excel 能正确安装并读取 `manifest.xml`。
2. 清单中的 Ribbon、图标和网址符合 Office 的严格规范。
3. Excel 信任 `https://localhost:5173` 的本地开发证书。
4. 使用时本地网页服务和 API 代理仍在运行。

今天的问题已经逐一定位并解决。最终采用的是**本机受信任加载项目录**，而非一次性调试加载。

## 2. 今天遇到的问题总览

| 现象 | 真正原因 | 最终处理 |
| --- | --- | --- |
| 找不到“上传我的加载项” | 桌面 Excel 的界面/账号策略没有提供该入口 | 不再依赖该入口，改用本机受信任加载项目录 |
| 在“开发工具 - XML 工具”导入时报证书问题 | 该工具处理工作簿 XML，不是 Office Web Add-in | 停止使用该入口 |
| 浏览器能打开 localhost，Excel 却没有 Ribbon | 清单中的 Ribbon 按钮缺少 Excel 必需的图标资源 | 补齐 16、32、80 像素 PNG 图标并修正清单 |
| 显示“此加载项不再可用，请在 Visual Studio 中重新运行” | Excel 缓存了第一次失败的开发清单；这是一条历史通用提示 | 清理 Office Wef/WebView 缓存并重新加载 |
| 关闭自动打开的 Excel 后 Ribbon 消失 | 自动旁加载只是一轮临时调试会话，绑定临时工作簿 | 改用持久的共享目录加载项目录 |
| 不同 Excel 页面没有“高级”菜单 | Microsoft 365 的界面会因版本、账号和策略而不同 | 不再假设统一菜单，使用已登记的本机目录 |

## 3. 问题一：为什么“XML 工具”不能安装这个项目？

`manifest.xml` 的后缀确实是 XML，但 **XML 是文件格式，不是功能类别**。

Excel 的“开发工具 - XML 工具”用于把 XML 架构、数据映射和工作表单元格关联起来，例如把一份业务 XML 数据导入表格。它期待的是工作簿数据的 XML 扩展包。

本项目的 `manifest.xml` 则是 Office 加载项清单，里面说明：

- 加载项叫什么；
- 应该在哪个 Office 程序中出现；
- Ribbon 上显示哪些按钮；
- 点击按钮后从哪个 HTTPS 地址加载网页；
- 需要哪些权限。

把 Office 加载项清单交给 XML 工具，就像把“应用安装说明书”交给“表格数据导入器”。两者不是同一套系统，所以证书提示也不能说明项目 HTTPS 证书有问题。

**经验：** 以后看到 `.xml`，先确认它是“数据 XML”还是“Office Add-in manifest”。后者绝不通过开发工具中的 XML 工具导入。

## 4. 问题二：证书到底有没有问题？

本项目的网页任务窗格位于 `https://localhost:5173`。Office 加载项要求网页地址使用 HTTPS，因此开发机需要一个仅供本机使用的 `localhost` 证书。

项目使用微软 Office 开发证书工具：

```powershell
npm.cmd run certs:install
```

浏览器能够无红色警告打开 `https://localhost:5173`，说明这台电脑当前 Windows 用户已信任证书。这一步是必要的，但它**只解决“Excel 是否信任本地 HTTPS”**，不保证清单一定正确。

今天桌面 Excel 的后续失败，最终并不是证书问题。证书已正常工作，真正的问题出在加载项清单、缓存与临时旁加载方式。

## 5. 问题三：为什么 Excel 不显示 Excel Tutor Ribbon？

Office 运行日志给出了关键线索：Ribbon 按钮缺少必需图标。

网页版 Excel 对清单细节相对宽容，但桌面 Excel 对带按钮的 Ribbon 命令更严格。每个按钮以及所在的命令组需要在清单中引用图标资源；图标必须能从 HTTPS 地址真实下载。

修复内容包括：

- 新增 `public/assets/icon-16.png`、`icon-32.png`、`icon-80.png`；
- 在 `manifest.xml` 的按钮和命令组中引用这三种尺寸；
- 在清单的 `<Resources>` 内按规定顺序声明图标、URL、短文本、长文本；
- 将清单版本升级到合法版本，确保 Excel 识别为新清单。

之后使用微软清单校验工具验证：

```powershell
npx.cmd --yes office-addin-manifest validate manifest.xml
```

结果为 `The manifest is valid.`。同时验证三个图标地址都返回 `image/png`，而不是网页 HTML。

**经验：** 桌面 Excel 出现模糊的“加载项不可用”提示时，不要只盯着证书。先验证 manifest，并打开 Office 运行日志；真正原因常常是图标、资源 ID 或元素顺序。

## 6. 问题四：为什么修复后仍然显示旧错误？

Office 会缓存加载项，主要有两类：

- **Wef 缓存**：保存已安装/旁加载加载项的清单与资源信息；
- **WebView 缓存**：保存任务窗格网页、脚本、图标等网页资源。

缓存本意是让 Office 不必每次都重新下载资源，但开发时会带来副作用：第一次失败的清单可能仍被 Excel 使用。今天的日志仍显示旧清单版本，说明 Excel 没有真正读取修复后的清单。

“此加载项不再可用，请在 Visual Studio 中重新运行”的文本也是一个容易误导人的历史通用提示。它并不意味着必须使用 Visual Studio；它只表示 Excel 当前持有的开发加载项记录已经无效。

正确处理顺序是：

1. 保存并关闭所有 Excel 窗口；
2. 停止旧的开发旁加载；
3. 清理 Office 缓存；
4. 重新启动本地服务并重新加载清单。

本机执行的清理命令是：

```powershell
npx.cmd --yes office-addin-cache clear
```

它会清理 Wef 和 WebView 加载项缓存。不会删除工作簿、项目代码或 `.env`，但其他 Web 加载项的临时缓存也会在下次使用时重新生成。

## 7. 问题五：自动旁加载为什么关掉 Excel 就消失？

为绕开“上传我的加载项”按钮缺失的问题，项目加入了：

```powershell
npm.cmd run start:desktop
```

该命令使用微软 `office-addin-debugging` 工具完成：

1. 启动本地网页和 API 服务；
2. 将开发清单注册为本次调试会话；
3. 自动打开一个临时 Excel 工作簿；
4. 在该临时工作簿中加载 Excel Tutor。

这是**调试方式**，不是安装方式。关闭自动打开的临时工作簿后，开发会话结束；再普通地打开一个新工作簿，Ribbon 不会自动保留。这是预期行为，不是新的程序错误。

## 8. 最终方案：本机受信任加载项目录

为了让普通工作簿也能使用 Excel Tutor，今天配置了一个本机持久目录：

```text
项目中的 catalog 文件夹
  └─ 只复制 manifest.xml
       └─ 通过 Windows 共享为 ExcelTutorCatalog
            └─ 登记为当前 Windows 用户的受信任加载项目录
```

这里有两个重要的安全设计：

- **不共享整个项目目录。** 项目根目录可能有 `.env`，不能作为共享目录。
- 共享目录只包含 `manifest.xml`；该文件没有 DeepSeek API Key，只包含 `localhost` 地址和加载项配置。

第一次在 Excel 中从“共享文件夹”目录添加 Excel Tutor 后，之后正常打开 Excel 时它就不再依赖临时调试工作簿。

详细的一次性配置和使用步骤见：`PERSISTENT_CATALOG_GUIDE.md`。

## 9. 以后该怎样使用？

### 日常使用 AI

在项目目录运行：

```powershell
npm.cmd run dev
```

然后正常打开 Excel，在 Ribbon 中打开 Excel Tutor。

为什么每次仍要运行这个命令？因为持久目录只保存“去哪里加载页面”的清单；聊天页面仍在本机 `https://localhost:5173`，DeepSeek 代理仍在 `http://127.0.0.1:3001`。不运行服务时，Ribbon 可能还在，但任务窗格无法正常连接。

### 只想快速测试新代码

可以使用：

```powershell
npm.cmd run start:desktop
```

它适合临时调试，不适合作为长期安装方式。

### 修改了 manifest.xml

先刷新共享目录中的清单：

```powershell
npm.cmd run catalog:refresh
```

然后关闭 Excel、清理 Office 加载项缓存并重新打开 Excel。涉及 Ribbon、图标、名称或 URL 的改动尤其需要这样做。

## 10. 一份实用的排障顺序

以后若桌面 Excel 再出现问题，按这个顺序检查即可：

1. 浏览器能否打开 `https://localhost:5173`？不能则先检查本地服务和证书。
2. `npm.cmd run build` 是否通过？
3. `npx.cmd --yes office-addin-manifest validate manifest.xml` 是否显示清单有效？
4. 图标 URL 是否能返回真实 PNG？
5. 是否修改过 manifest？若修改过，刷新目录并清理 Office 缓存。
6. 是在临时调试工作簿中，还是已经通过受信任目录添加到普通 Excel？
7. 本地 `npm.cmd run dev` 是否仍在运行？

这套顺序能把“证书、清单、缓存、安装方式、服务状态”分开，不再把所有报错都归因于证书。

## 11. 相关文件速查

| 文件 | 作用 |
| --- | --- |
| `manifest.xml` | Excel 读取的加载项清单与 Ribbon 定义 |
| `public/assets/icon-*.png` | 桌面 Excel Ribbon 必需图标 |
| `package.json` | `dev`、`start:desktop`、`catalog:refresh` 等命令 |
| `scripts/refresh-local-catalog.ps1` | 把新清单复制到持久目录 |
| `scripts/create-local-catalog-share.ps1` | 创建只读本机共享（首次配置需要管理员权限） |
| `scripts/trust-local-catalog.ps1` | 写入当前用户的 Excel 受信任目录配置 |
| `DESKTOP_SIDELOAD_GUIDE.md` | 临时自动旁加载说明 |
| `PERSISTENT_CATALOG_GUIDE.md` | 持久加载项目录说明 |

## 12. 这次排障得到的核心认识

这个项目的难点不在 DeepSeek API，而在于 Office 桌面客户端的加载机制。可以把它记成一句话：

> **清单决定 Excel 看见什么，证书决定 Excel 敢不敢打开网页，缓存决定 Excel 实际还在用哪个版本，目录决定加载项能否长期存在。**

只要这四层都正常，Excel Tutor 就能稳定地在本地 Excel 中工作。

## 参考资料

- [Microsoft：Office 加载项开发错误排查](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/troubleshoot-development-errors)
- [Microsoft：清除 Office 加载项缓存](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/clear-cache)
- [Microsoft：Windows 共享文件夹加载项目录](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins)
- [Microsoft：Office 加载项清单资源](https://learn.microsoft.com/en-us/javascript/api/manifest/resources?view=word-js-preview)