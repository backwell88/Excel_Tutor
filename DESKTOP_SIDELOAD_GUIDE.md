# 在本地 Excel 中自动安装 Excel Tutor

## 这份说明解决什么问题？

本项目是 **Office 加载项**，不是 VBA 宏加载项，也不是 Excel 的 XML 扩展包。

`manifest.xml` 是给 Office 加载项系统读取的清单文件。请不要在 Excel 的“开发工具 - XML 工具”中导入它；该功能处理的是工作簿 XML 数据，不会正确安装本项目，并可能显示与本项目无关的证书错误。

下面的“自动旁加载”会让微软的开发工具把 `manifest.xml` 注册到当前 Windows 用户的桌面 Excel 中，不依赖 Excel 界面里是否显示“上传我的加载项”。

## 只需首次完成的准备

1. 在项目根目录确认已经有 `.env`，并且其中的 `DEEPSEEK_API_KEY` 已填写。
2. 关闭所有 Excel 窗口。
3. 在 PowerShell 中进入项目目录，例如：

   ```powershell
   cd D:\J_Code\Excel_Tutor
   ```

4. 安装并信任本项目的本地 HTTPS 开发证书：

   ```powershell
   npm.cmd run certs:install
   ```

   如果显示已经信任 `https://localhost`，这是正常结果。

## 启动并自动旁加载

每次想在本地桌面 Excel 中使用时，先执行：

```powershell
npm.cmd run start:desktop
```

该命令会完成四件事：

1. 启动 React/Vite 前端：`https://localhost:5173`。
2. 启动保存 API Key 的本地 Express 代理：`http://127.0.0.1:3001`。
3. 检查前端端口是否可访问。
4. 在当前 Windows 用户下注册 `manifest.xml`，然后打开桌面 Excel。

Excel 打开后，寻找功能区里的 `Excel Tutor` 选项卡，再点击 `Open Tutor`。如果选项卡没有立刻出现，请到“主页 - 加载项”中选择 Excel Tutor 一次；不要返回“开发工具 - XML 工具”。

## 停止并移除本地注册

结束测试时，在另一个 PowerShell 窗口执行：

```powershell
npm.cmd run stop:desktop
```

这会移除自动旁加载留下的本地注册。之后关闭第一个 PowerShell 窗口，前端和本地 API 服务也会停止。

## 常见情况

| 现象 | 含义和处理方式 |
| --- | --- |
| 显示 `You already have trusted access to https://localhost` | 证书已正确安装，无需重复处理。 |
| 启动前端后浏览器能打开 `https://localhost:5173` | 本地网页服务正常；继续用自动旁加载启动 Excel。 |
| Excel 已经打开 | 先完全关闭 Excel，再重新执行 `npm.cmd run start:desktop`。 |
| 提示 5173 端口被占用 | 说明可能已有旧的开发服务在运行；关闭旧终端后重试。 |
| 仍然不能启动 Excel | 请保留 PowerShell 的完整报错并截图；此时再判断是 Office 安装、账号策略还是 WebView 问题。 |

## API Key 是否需要重新配置？

不需要。自动旁加载仍使用同一个项目、同一个 `.env` 和同一个本地代理。API Key 不会写入 `manifest.xml`、Excel 工作簿或加载项前端。

## 退出后会怎样？

这是开发/本机测试方式：只有这台电脑、当前 Windows 用户，并且本地服务运行时可用。若将来要让其他电脑长期使用，应改用 Microsoft 365 管理员部署、加载项目录或正式发布，而不是复制这个本地开发配置。