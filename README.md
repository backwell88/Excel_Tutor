# Excel Tutor

Excel Tutor 是面向 Excel 365 Windows 用户的 Keyboard-first 教学工具。它在 Excel 中提供聊天界面，告诉用户下一步应如何操作，而不会自动修改业务工作表。

用户主动点击“保存知识点”后，工具才会把一条通用 Excel 笔记追加到当前工作簿第一个工作表中的 `Excel Notes` 表格。

## 快速启动

1. 安装 Node.js 22 或更高版本。
2. 在项目根目录打开 PowerShell。
3. 创建本地配置：

   ```powershell
   Copy-Item .env.example .env
   ```

4. 编辑 `.env`，填写 DeepSeek API Key：

   ```dotenv
   DEEPSEEK_API_KEY=你的真实密钥
   DEEPSEEK_MODEL=deepseek-chat
   PORT=3001
   ```

5. 安装依赖并安装 Office 开发证书：

   ```powershell
   npm.cmd install
   npm.cmd run certs:install
   ```

   接受 Windows 的证书安装提示。此步骤只需要在本机完成一次。

6. 启动前端和本地 AI 代理：

   ```powershell
   npm.cmd run dev
   ```

不要关闭该终端。前端运行在 `https://localhost:5173`，本地代理运行在 `http://127.0.0.1:3001`。

## 在 Excel 中使用

上传项目根目录的 `manifest.xml` 后，在 Ribbon 中打开 `Excel Tutor`，点击 `Open Tutor`。

如果 Excel 提示本地 HTTPS 证书不受信任：

1. 关闭 `npm.cmd run dev`。
2. 再运行 `npm.cmd run certs:install`。
3. 重启 Excel。
4. 重新运行 `npm.cmd run dev` 后再次加载加载项。

## 验证命令

```powershell
npm.cmd run test
npm.cmd run build
```

更多架构和实现原理请阅读 `IMPLEMENTATION_GUIDE.md`。

