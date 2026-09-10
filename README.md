# Excel Tutor

Excel Tutor 是一个嵌入 Excel 的本地 AI 教学工具。它不替用户修改业务工作表，而是告诉用户下一步该怎样操作：优先给出快捷键、Alt KeyTips 和最少必要步骤。

例如，用户问“怎么快速筛选？”，它会解释 `Ctrl + Shift + L`，而不是替用户直接开启筛选。

## 项目边界

| 已实现 | 不做的事情 |
| --- | --- |
| Excel Ribbon 中的 `Excel Tutor`、`Open Tutor`、`Settings` | 自动修改业务工作表 |
| 右侧聊天界面与当前会话上下文 | VBA、Office Scripts、Python 或 RPA 自动化 |
| DeepSeek 问答与本地 API Key 配置 | 登录、云同步、长期聊天历史 |
| 按需读取当前选区、大选区采样 | 自动保存全部聊天记录、自动去重、练习系统 |
| 复制回答、保存知识点到工作簿 | 审计、会计等业务结论判断 |

核心原则是：**教用户做，不替用户做。**

## 系统如何工作

```text
Excel 365
  └─ manifest.xml（告诉 Excel 显示什么按钮、打开什么网页）
       └─ React 任务窗格：https://localhost:5173
            ├─ 聊天、选区开关、复制、保存知识点
            ├─ Office.js：读取当前选区、写入 Excel Notes
            └─ 调用本机代理

Node.js / Express 本地代理：http://127.0.0.1:3001
  ├─ 从 .env 读取 DeepSeek API Key
  ├─ 组织 Tutor 与 Note Compiler 请求
  └─ 调用 DeepSeek API
```

这种设计刻意把 Excel 数据访问与 AI 密钥分开：

- React 前端可通过 Office.js 读取当前工作簿，但没有 API Key。
- 本地代理保存 API Key，但不会主动修改业务表。
- API Key 只在本机 `.env` 中，不会写进 Excel、前端代码或 GitHub。

## 提问时发生什么

1. 用户在 Excel 右侧的任务窗格输入问题。
2. 前端判断问题是否可能需要当前选区。
3. 若需要，且“使用当前选区”开关开启，Office.js 读取必要的值和公式。
4. 前端将问题、会话与可选的选区上下文发送给本机代理。
5. 本机代理从 `.env` 读取密钥并调用 DeepSeek。
6. 回答显示在任务窗格中，可复制或保存为知识点。

会话只保存在任务窗格当前内存中；关闭任务窗格、工作簿或 Excel 后，聊天记录不会自动恢复。

## 选区与隐私

不是每个问题都会上传选区。快捷键、函数写法等通用问题只发送用户的文字。

当问题出现“这”“选中”“当前”“公式错误”“汇总”“透视表”等表达时，程序才会考虑读取选区，而且用户可随时关闭“使用当前选区”。这是可预测的关键词判断，不是让模型自行决定。

| 选区大小 | 发送给 AI 的内容 |
| --- | --- |
| 不超过 200 行且不超过 30 列 | 单元格地址、值和公式 |
| 超过 200 行或超过 30 列 | 总行列数、表头、最多 30 × 30 的样本、数据类型概况 |

因此，程序不会默认上传整个工作簿。公式单元格会同时提供结果与公式文本，例如 `300` 和 `=A2+B2`，以便解释公式问题。

## 保存知识点

点击“保存知识点”并不是原样保存聊天记录。程序会再次请求 AI，把“用户问题 + Tutor 回答”整理成一条可复用的 Excel 知识点，再写入当前工作簿的 `Excel Notes` 工作表。

首次保存时会创建固定表名 `ExcelTutorNotesTable`，列为：知识点、类型、核心操作、说明、示例。固定表名比只依赖工作表名称可靠；即使用户重命名工作表，程序仍能找到它。每次保存只追加一行，不会覆盖旧笔记。

## 主要文件

| 文件 | 作用 |
| --- | --- |
| `manifest.xml` | Excel 加载项清单和 Ribbon 定义 |
| `src/App.tsx` | 聊天、设置、复制、保存知识点界面 |
| `src/lib/context.ts` | 选区读取、采样和上下文判断 |
| `src/lib/notes.ts` | Excel Notes 的创建与追加 |
| `src/lib/api.ts` | 前端调用本机代理 |
| `server/index.ts` | Express 代理与 DeepSeek 调用 |
| `.env.example` | 本地配置模板 |
| `vite.config.ts` | Vite 本地 HTTPS 开发服务器 |

## 验证项目

```powershell
npm.cmd run test
npm.cmd run build
```

`test` 覆盖选区上下文与采样逻辑；`build` 执行 TypeScript 检查和生产构建。它们不能替代真实 Excel 中的人工验收。

## 给使用者的文档

- `无脑使用步骤.md`：最短的启动和日常使用步骤。
- `部署阶段问题及相关说明.md`：今天桌面 Excel 接入时的错误、原因与解决原理。
- `Excel_Tutor_MVP_Requirements.md`：项目最初需求文档。
- `CHANGELOG.md`：每个版本改了什么、如何回退。