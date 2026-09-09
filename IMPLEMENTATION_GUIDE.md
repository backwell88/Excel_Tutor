# Excel Tutor：实现说明与使用原理

## 1. 项目要解决什么问题？

Excel Tutor 是一个嵌入 Excel 的实战型教师。它回答“下一步在 Excel 里怎么做”，优先给出快捷键、Alt KeyTips 和最小必要步骤；真正的 Excel 操作仍由用户完成。

例如，用户问“怎么快速筛选？”，工具应该回答 `Ctrl + Shift + L`，而不是替用户开启筛选。

这也是项目最重要的边界：**教用户做，不替用户做。**

## 2. 哪些功能在 MVP 内？

| 已实现 | 不做的事情 |
| --- | --- |
| Ribbon 中的 `Excel Tutor`、`Open Tutor`、`Settings` | 自动修改业务工作表 |
| 右侧聊天界面、当前会话上下文 | VBA、Office Scripts、Python 或 RPA 自动化 |
| DeepSeek 问答、本地 API Key 配置 | 登录、云同步、长期聊天历史 |
| 选区按需读取与大选区采样 | 自动保存笔记、自动去重、练习系统 |
| 复制回答、保存知识点到工作簿 | 业务领域判断，例如审计或会计准则判断 |

## 3. 系统由哪几部分组成？

```text
Excel 365
  └─ manifest.xml
       └─ Task Pane（React 前端，https://localhost:5173）
            ├─ 聊天界面、选区开关、复制、保存知识点
            ├─ Office.js：读取当前选区、写入 Excel Notes
            └─ 调用本地代理

Node.js / Express 本地代理（http://127.0.0.1:3001）
  ├─ 从 .env 读取 DeepSeek API Key
  ├─ 组装 Tutor 和 Note Compiler 请求
  └─ 调用 DeepSeek Chat Completions API

DeepSeek API
```

这个结构刻意把“Excel 数据访问”和“AI 调用”分开：

- 前端可以通过 Office.js 与当前工作簿交互，但没有 API Key。
- 本地代理保存 API Key，但不会直接修改 Excel。
- API Key 只存在于本机 `.env`，不会写入工作簿、Excel Notes 或前端代码。

## 4. 提问时的完整流程

1. 用户在 Task Pane 输入问题。
2. 前端检查本地代理是否已经在 `.env` 中读到 API Key。
3. 前端判断该问题是否依赖当前选区。
4. 若需要选区且“使用当前选区”开关开启，则通过 Office.js 读取必要信息。
5. 前端把本次会话、模型名和选区上下文发送给本地代理。
6. 本地代理附加 Excel Tutor 的规则后调用 DeepSeek。
7. 前端显示 AI 回答，并提供“复制”和“保存知识点”按钮。

当前会话消息只保存在浏览器内存中。关闭 Task Pane、关闭工作簿或重启 Excel 后，不要求恢复这些消息。

## 5. 为什么不是每次都上传选区？

很多问题根本不需要工作簿数据，例如：

- “筛选快捷键是什么？”
- “XLOOKUP 怎么写？”
- “怎么快速插入一行？”

此类问题只发送用户的文字。

当问题包含“这”“选中”“当前”“公式错误”“汇总”“透视表”等表述时，MVP 会认为选区可能有帮助。只有此时，且用户没有关闭“使用当前选区”，程序才读取值和公式。

这是一个简单的关键词判断，而不是模型判断。它的好处是可预测、无额外费用；缺点是偶尔可能多读或漏读。因此开关始终交由用户控制。

## 6. 大选区如何保护数据？

程序绝不默认上传整个工作簿。对于当前选区，规则如下：

| 选区大小 | 发给 AI 的内容 |
| --- | --- |
| 不超过 200 行且不超过 30 列 | 单元格地址、值和公式 |
| 超过 200 行或超过 30 列 | 总行列数、表头、最多 30 行 × 30 列样本、数据类型概况 |

这叫做采样。模型能够了解数据大致结构，但不会收到整块原始数据。

如果单元格包含公式，程序会同时提供计算结果和公式文本，例如计算结果 `300` 与公式 `=A2+B2`。这有助于解释公式报错或结果异常。

## 7. DeepSeek 本地代理做了什么？

本地代理位于 `server/index.ts`，提供三个接口：

| 接口 | 用途 |
| --- | --- |
| `GET /health` | 检查是否配置 API Key |
| `POST /api/tutor` | 生成 Excel 操作指导 |
| `POST /api/notes` | 将一问一答整理为知识点 |

代理只监听 `127.0.0.1`，不对局域网开放；默认只接受本机前端 `https://localhost:5173` 的请求。

Tutor 系统规则要求模型：优先键盘操作、先回答当前问题、避免长篇基础教学、不替用户执行操作、不宣称已经改动工作簿。

## 8. “保存知识点”是怎样工作的？

点击“保存知识点”后，程序不会原样保存聊天记录，而是执行第二次 AI 请求：

```text
用户问题 + Tutor 回答
        ↓
Note Compiler 去掉工作簿偶然细节
        ↓
一条通用的 Excel 知识点
        ↓
写入当前工作簿的 Excel Notes
```

生成的结构固定为：

```json
{
  "knowledge_point": "快速开启或关闭筛选",
  "type": "Shortcut",
  "core_operation": "Ctrl + Shift + L",
  "description": "对当前数据区域快速开启或关闭自动筛选。",
  "example": ""
}
```

类型只能是 `Shortcut`、`Formula`、`Operation`、`Pivot`、`Power Query`、`Chart` 或 `Other`。

## 9. 为什么使用固定表名？

首次保存时，程序会创建 `Excel Notes` 工作表和固定表名 `ExcelTutorNotesTable`。表内有五列：知识点、类型、核心操作、说明、示例。

固定表名比只依赖工作表名称可靠：即使用户把 `Excel Notes` 重命名，程序仍可通过表名找到笔记。每次保存都追加一行，不会覆盖旧笔记、合并或自动去重。程序还会确保该工作表处于工作簿第一个位置。

## 10. 文件职责速查

```text
manifest.xml                 Excel 加载项清单和 Ribbon 定义
index.html                   Task Pane 网页入口，加载 Office.js
src/App.tsx                  聊天、设置、复制、保存知识点界面
src/lib/context.ts           选区读取、采样和上下文判断
src/lib/notes.ts             Excel Notes 的创建、定位和追加
src/lib/api.ts               前端调用本地代理
server/index.ts              Express 代理和 DeepSeek 调用
.env.example                 本地配置模板
vite.config.ts               React/Vite 服务器与 Office 开发证书
```

## 11. 本地 HTTPS 证书为什么重要？

Excel 加载项从 `https://localhost:5173` 加载页面。浏览器可以临时忽略不受信任的证书，但 Excel 通常会拒绝加载不可信的本地 HTTPS 页面，因此会显示证书安全错误。

项目使用 Microsoft Office 的开发证书工具。首次配置时运行：

```powershell
npm.cmd run certs:install
```

它会生成并让 Windows 信任仅用于 `localhost` 开发的证书。之后 Vite 会使用该证书启动本地前端服务器。若证书已存在，命令会提示已经受信任，可以安全重复执行。

这类证书只用于本机开发，不适合发布给其他用户或部署到生产环境。

## 12. 如何验证 MVP？

建议在真实 Excel 中依次检查：

1. Ribbon 中出现 `Excel Tutor`。
2. `Open Tutor` 打开右侧窗口。
3. 未配置 Key 时有明确提示。
4. 配置有效 Key 后，普通问题能得到简洁回答。
5. 关闭“使用当前选区”后，提问不会发送选区值和公式。
6. 超过 200 行的选区会采用采样。
7. 复制按钮能写入剪贴板。
8. 保存知识点后会创建或更新第一个工作表 `Excel Notes`。

自动化方面，`npm.cmd run test` 覆盖上下文判断与采样逻辑，`npm.cmd run build` 执行 TypeScript 检查和生产构建。它们不能替代真实 Excel 的人工验收。

