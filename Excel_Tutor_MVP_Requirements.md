# Excel Tutor — MVP 产品需求与开发规格

> 文档用途：供 Coding Agent / AI 开发代理直接读取并实现。  
> 文档类型：MVP Product Requirements + Functional Specification  
> 核心原则：**Keyboard-first、Read + Teach、Minimal UI、User-triggered Notes、No Agent Execution**

---

## 0. 项目摘要

```yaml
project:
  name: "Excel Tutor"
  type: "Microsoft Excel 365 Add-in"
  primary_platform: "Windows + Microsoft 365 Excel"
  target_users:
    - "审计"
    - "会计"
    - "证券"
    - "其他金融财会领域中已具备基础 Excel 使用能力的用户"

  primary_goal: >
    在用户真实使用 Excel 时，通过自然语言提问，
    快速获得以键盘操作优先的 Excel 使用指导，
    帮助用户本人提升 Excel 操作效率与技能，而不是由 AI 代替用户执行任务。

  success_definition: >
    用户遇到 Excel 操作问题时，可以快速获得“下一步怎么做”的明确答案；
    用户通过亲手操作逐渐形成熟练度，并可将有价值的知识点主动保存到工作簿中的 Excel Notes Sheet。

  non_goal:
    - "不替用户执行 Excel 操作"
    - "不自动修改原始工作簿内容"
    - "不理解或执行业务逻辑，例如审计底稿逻辑、会计准则判断"
    - "不建设长期知识管理系统"
    - "不保存长期聊天历史"
    - "不做练习、复习、测试、游戏化"
```

---

# 1. 产品定位

## 1.1 产品角色

Excel Tutor 是一个**嵌入 Excel 的实战型 Excel 教师**。

它解决的问题是：

```text
用户正在 Excel 中工作
        ↓
用户遇到“我想实现 X，但不知道怎么高效完成”的问题
        ↓
用户在右侧 Tutor 面板提问
        ↓
AI 根据问题及必要的当前选区上下文理解目标
        ↓
AI 给出 Keyboard-first 的操作方法
        ↓
用户亲自完成操作
        ↓
如该知识有复用价值，用户主动点击“保存知识点”
        ↓
AI 将当前问答抽象成通用 Excel 知识
        ↓
写入当前 Workbook 的第一个 Sheet：Excel Notes
```

## 1.2 核心设计原则

```yaml
principles:
  - id: P1
    name: "Keyboard First"
    rule: >
      只要某项操作存在高效、稳定的键盘路径，
      默认优先提供键盘快捷键或 Alt KeyTips 操作路径。
    mouse_path: "仅在有必要辅助定位功能时补充，不作为默认答案主体。"

  - id: P2
    name: "Teach, Do Not Execute"
    rule: >
      AI 负责告诉用户如何完成操作，但不自动执行工作簿修改。
      用户必须亲自完成 Excel 操作。

  - id: P3
    name: "Action First"
    rule: >
      默认回答只提供完成当前目标所需的最小充分信息。
      优先回答“接下来怎么做”，不主动展开教学。
      用户继续追问时再解释原理。

  - id: P4
    name: "Minimal Context"
    rule: >
      只有问题需要当前 Excel 内容时才读取并发送选区上下文；
      能不读取就不读取，能少读取就不多读取。

  - id: P5
    name: "User-controlled Notes"
    rule: >
      不自动保存知识点。
      只有用户点击“保存知识点”后才调用 AI 做二次抽象并写入 Notes。

  - id: P6
    name: "Workbook-local Notes"
    rule: >
      笔记仅保存在当前 Workbook 内。
      不做账号、云同步、跨 Workbook 知识库。
```

---

# 2. 用户能力假设

```yaml
user_assumptions:
  excel_level: "非零基础"
  user_can:
    - "进行基本单元格编辑"
    - "输入普通公式"
    - "新建和切换 Sheet"
    - "复制、粘贴、保存文件"
    - "进行基本 Excel 操作"

  tutor_should_not_proactively_teach:
    - "什么是单元格"
    - "如何输入 ="
    - "如何新建 Sheet"
    - "如何复制粘贴"
    - "如何保存工作簿"

  tutor_should_teach:
    - "快捷键和 Keyboard-first 工作流"
    - "更高效的数据选择和导航"
    - "排序、筛选、查找替换"
    - "格式处理"
    - "常用与高级公式"
    - "函数语法及适用场景"
    - "数据透视表"
    - "Power Query"
    - "图表"
    - "Excel 365 内置高级功能"
```

---

# 3. 功能范围

## 3.1 MVP 必须实现

```yaml
mvp_features:
  - "Excel Ribbon 中增加 Excel Tutor Tab"
  - "Open Tutor 按钮"
  - "Settings 按钮"
  - "右侧 Task Pane 聊天界面"
  - "自然语言问答"
  - "默认 Keyboard-first 回答"
  - "当前活动 Sheet / 当前选区识别"
  - "使用当前选区开关，默认开启"
  - "按需读取选区上下文"
  - "DeepSeek API 调用"
  - "当前使用期间的聊天上下文"
  - "每条 AI 回复提供复制按钮"
  - "每条 AI 回复提供保存知识点按钮"
  - "首次保存知识点时自动创建 Excel Notes"
  - "Excel Notes 固定在 Workbook 第一个 Sheet"
  - "知识点结构化写入 Excel Notes"
  - "基础错误处理"
```

## 3.2 明确不实现

```yaml
out_of_scope:
  execution:
    - "AI 自动修改用户当前数据"
    - "AI 自动创建公式"
    - "AI 自动创建 Pivot"
    - "AI 自动格式化原始 Sheet"
    - "AI 自动完成用户任务"

  automation:
    - "VBA"
    - "Office Scripts"
    - "Python 自动化"
    - "RPA"

  business_domain:
    - "审计底稿逻辑"
    - "会计准则知识库"
    - "证券业务知识库"
    - "事务所模板理解"

  knowledge_system:
    - "跨 Workbook 知识库"
    - "账号系统"
    - "云同步"
    - "自动知识点去重"
    - "自动知识点推荐"
    - "练习系统"
    - "复习系统"
    - "熟练度系统"
    - "技能图谱"
    - "游戏化"

  conversation:
    - "永久聊天历史"
    - "跨 Workbook 聊天历史"
    - "云端聊天记录"

  model_platform:
    - "多模型市场"
    - "多 Agent"
```

---

# 4. 整体技术结构

```yaml
architecture:
  excel_host:
    platform: "Microsoft Excel 365"
    addin_type: "Office Add-in"
    api: "Office.js"

  frontend:
    components:
      - "Ribbon Commands"
      - "Task Pane UI"
      - "Settings UI"
      - "Conversation State"
      - "Context Toggle"

  backend_or_proxy:
    responsibility:
      - "安全调用 DeepSeek API"
      - "避免在前端代码中硬编码 API Key"
      - "统一 AI 请求格式"
      - "处理网络与 API 错误"

  ai:
    provider: "DeepSeek"
    default_model: "deepseek-chat"
    roles:
      tutor: "回答 Excel 操作问题"
      note_compiler: "将指定问答抽象成结构化知识点"

  excel_data_access:
    mode: "read-only except Excel Notes"
    readable:
      - "active worksheet name"
      - "selected range address"
      - "selected range values"
      - "selected range formulas"
      - "必要的表头和数据类型信息"
    writable:
      - "Excel Notes Sheet only"
```

---

# 5. Ribbon 规格

## 5.1 Tab

```yaml
ribbon:
  tab:
    id: "ExcelTutor.Tab"
    label: "Excel Tutor"

  controls:
    - id: "ExcelTutor.OpenTutor"
      type: "button"
      label: "Open Tutor"
      action: "打开或激活右侧 Task Pane"

    - id: "ExcelTutor.Settings"
      type: "button"
      label: "Settings"
      action: "打开设置界面"
```

## 5.2 不在 Ribbon 中实现的功能

```yaml
ribbon_exclusions:
  - "保存知识点"
  - "复制回答"
  - "读取选区"
  - "清空聊天"
  - "新建 Notes"
  - "模型快速切换"
```

---

# 6. Task Pane UI

## 6.1 布局

```text
┌──────────────────────────────┐
│ Excel Tutor                  │
│ Sheet1 · A2:D18              │
│ [✓] 使用当前选区             │
├──────────────────────────────┤
│                              │
│ User message                 │
│                              │
│ AI response                  │
│ [复制] [保存知识点]          │
│                              │
│ User message                 │
│                              │
│ AI response                  │
│ [复制] [保存知识点]          │
│                              │
├──────────────────────────────┤
│ 输入问题……                   │
│                       [发送] │
└──────────────────────────────┘
```

## 6.2 UI 状态定义

```yaml
task_pane_state:
  header:
    title: "Excel Tutor"
    show_context:
      worksheet_name: true
      selected_range_address: true

  context_toggle:
    label: "使用当前选区"
    default: true
    behavior:
      enabled: "允许本次发送按规则读取当前选区"
      disabled: "本次请求不得发送工作表内容给 AI"

  chat:
    persistent_scope: "当前 Task Pane / 当前使用会话"
    persistence_after_restart: false

  input:
    multiline: true
    send_button: true
    enter_behavior: "可由实现选择；推荐 Enter 发送，Shift+Enter 换行"

  assistant_message_actions:
    - "复制"
    - "保存知识点"
```

---

# 7. Settings 规格

```yaml
settings:
  fields:
    - id: "api_key"
      label: "DeepSeek API Key"
      type: "password"
      required: true

    - id: "model"
      label: "Model"
      type: "text_or_select"
      default: "deepseek-chat"

  hidden_advanced_parameters:
    - "temperature"
    - "top_p"
    - "max_tokens"
    - "system_prompt"
    - "base_url"

  api_key_rules:
    must_not_store_in:
      - "Workbook cells"
      - "Excel Notes"
      - "Workbook metadata visible to recipients"
      - "source code"
    preferred_storage:
      - "设备本地安全存储"
      - "或经后端代理管理"
```

---

# 8. 提问流程

## 8.1 主流程

```yaml
question_flow:
  - step: 1
    action: "用户输入问题"

  - step: 2
    action: "用户点击发送"

  - step: 3
    action: "读取 UI 中的“使用当前选区”开关状态"

  - step: 4
    action: "获取当前活动 Sheet 名称和 Selected Range 地址"

  - step: 5
    action: "判断问题是否需要 Excel 上下文"

  - step: 6
    action: "若需要且开关开启，则构造最小 Context Snapshot"

  - step: 7
    action: "调用 Tutor AI"

  - step: 8
    action: "显示 AI 回答"

  - step: 9
    action: "在该回答下显示复制与保存知识点按钮"
```

---

# 9. Context Engine 规格

## 9.1 总原则

```yaml
context_policy:
  default: "minimal"
  selection_toggle_default: true
  never_send_entire_workbook_by_default: true

  no_context_examples:
    - "筛选快捷键是什么？"
    - "XLOOKUP 怎么写？"
    - "怎么快速插入一行？"

  context_required_examples:
    - "我选中的这些数据怎么按月份汇总？"
    - "这个公式为什么返回错误？"
    - "这块数据适合用 Pivot 还是 SUMIFS？"
```

## 9.2 Context Snapshot

```json
{
  "workbook_context": {
    "worksheet_name": "Sheet1",
    "selected_range": "A2:D18",
    "rows": 17,
    "columns": 4,
    "headers": ["部门", "姓名", "金额", "日期"],
    "cells": [
      {
        "address": "A2",
        "value": "销售部",
        "formula": null
      },
      {
        "address": "C2",
        "value": 1200,
        "formula": null
      },
      {
        "address": "D2",
        "value": "2026-09-01",
        "formula": null
      }
    ]
  }
}
```

## 9.3 读取限制

```yaml
selection_limits:
  raw_data_soft_limit:
    rows: 200
    columns: 30

  behavior_when_over_limit:
    - "不得发送完整选区"
    - "发送总行数和总列数"
    - "发送表头"
    - "发送前若干行样本"
    - "发送数据类型概况"
    - "必要时发送部分公式样本"

  recommended_sample_rows: 30
```

> 数值可在开发测试中调整，但必须保留“选区过大时降采样”的机制。

## 9.4 公式读取

如果单元格存在公式：

```yaml
formula_context:
  send:
    - "calculated_value"
    - "formula_text"
```

示例：

```json
{
  "address": "C2",
  "value": 300,
  "formula": "=A2+B2"
}
```

---

# 10. Tutor AI 规格

## 10.1 Tutor System Behavior

```yaml
tutor_behavior:
  role: "Excel 实战教师"

  priorities:
    - "直接回答用户接下来应该怎么做"
    - "Keyboard-first"
    - "最小充分解释"
    - "不替用户执行"
    - "不主动扩展到业务知识"

  answer_style:
    default_length: "short"
    theory: "only_if_needed_or_user_asks"
    mouse_instruction: "secondary"
    beginner_explanation: "do_not_proactively_include"

  multiple_methods:
    when: "存在多个明显合理的方法"
    behavior:
      - "每个方法用约一句话说明适用场景"
      - "推荐一个方案"
      - "推荐理由控制在约 2-3 句话"
      - "随后给出具体操作步骤"
```

## 10.2 Tutor System Prompt 建议

```text
You are Excel Tutor, an embedded Excel teacher for users who already know basic Excel.

Your job is to teach the user how to perform Excel tasks themselves.

Rules:
1. Do not perform or simulate workbook edits on behalf of the user.
2. Prefer keyboard shortcuts and Excel Alt KeyTips whenever practical.
3. Answer the user's immediate question first. Give the minimum sufficient instructions needed to proceed.
4. Do not proactively provide long theory, background, or beginner-level explanations. Explain further only when needed or when the user asks.
5. If multiple methods are genuinely useful, list each briefly, then recommend one and explain the recommendation in 2-3 concise sentences.
6. Treat the user's business context only as a description of the desired Excel outcome. Do not attempt to teach accounting, auditing, securities analysis, or firm-specific workbook logic unless the user explicitly asks about Excel mechanics.
7. When workbook context is provided, use it only to understand the Excel operation requested.
8. Never claim to have changed the workbook.
9. Keep responses concise and operational.
10. When formulas are relevant, provide the formula syntax and explain only the parameters necessary for the user's immediate task.
```

---

# 11. AI 请求结构

## 11.1 Tutor Request

```json
{
  "mode": "tutor",
  "conversation": [
    {
      "role": "user",
      "content": "我想把这部分按照部门汇总金额"
    }
  ],
  "context_enabled": true,
  "excel_context": {
    "worksheet_name": "Sheet1",
    "selected_range": "A1:D100",
    "headers": ["部门", "姓名", "金额", "日期"],
    "sample_rows": []
  }
}
```

## 11.2 Tutor Response

Tutor 回复可以保留 Markdown 文本，不强制完全 JSON 化。

推荐内部结构：

```json
{
  "answer_markdown": "**推荐：数据透视表。** ...",
  "used_excel_context": true
}
```

---

# 12. 复制功能

```yaml
copy_action:
  location: "每条 AI 回复下方"
  button_label: "复制"
  behavior: "复制该条 AI 回复的 Markdown/plain text 内容到系统剪贴板"
  success_feedback: "已复制"
  failure_feedback: "复制失败"
```

---

# 13. 保存知识点功能

## 13.1 触发

```yaml
save_note:
  trigger: "用户点击某条 AI 回复下方的“保存知识点”"
  automatic_detection: false
  automatic_save: false
```

## 13.2 保存流程

```yaml
save_note_flow:
  - step: 1
    action: "取得该 AI 回复对应的用户问题"

  - step: 2
    action: "取得该 AI 回复文本"

  - step: 3
    action: "调用 Note Compiler AI"

  - step: 4
    action: "得到结构化知识点"

  - step: 5
    action: "检查 Excel Notes 是否存在"

  - step: 6
    action: "若不存在则创建"

  - step: 7
    action: "确保 Excel Notes 位于 Workbook 第一个 Sheet"

  - step: 8
    action: "向 Notes 表格追加一行"

  - step: 9
    action: "UI 显示：已保存到 Excel Notes"
```

---

# 14. Note Compiler 规格

## 14.1 目标

Note Compiler 不是保存聊天，而是：

```text
具体问题
+
具体回答
        ↓
去除当前 Workbook 的偶然细节
        ↓
抽象为未来可复用的 Excel 知识
```

## 14.2 类型枚举

```yaml
note_types:
  - "Shortcut"
  - "Formula"
  - "Operation"
  - "Pivot"
  - "Power Query"
  - "Chart"
  - "Other"
```

AI 不得自行创造新的类型值。

## 14.3 输出 JSON Schema

```json
{
  "knowledge_point": "多条件求和",
  "type": "Formula",
  "core_operation": "SUMIFS",
  "description": "根据多个条件对指定数值区域进行求和。",
  "example": "=SUMIFS(金额列, 部门列, 部门条件, 日期列, 日期条件)"
}
```

## 14.4 Note Compiler Prompt 建议

```text
You are a compiler that converts an Excel tutoring interaction into one concise reusable Excel knowledge note.

Input:
- the user's question
- the tutor's answer

Goal:
Extract the general Excel knowledge that remains useful outside the current workbook.

Rules:
1. Do not save the conversation verbatim.
2. Remove company names, workbook-specific values, sheet-specific details, and incidental data.
3. Keep the note concise.
4. Return exactly one knowledge item.
5. type must be one of:
   Shortcut, Formula, Operation, Pivot, Power Query, Chart, Other.
6. core_operation should contain the most useful shortcut, function name, menu path, or concise action sequence.
7. example is optional in meaning but must be returned as a string; use an empty string if no example is useful.
8. Return valid JSON only.

Output schema:
{
  "knowledge_point": "string",
  "type": "Shortcut | Formula | Operation | Pivot | Power Query | Chart | Other",
  "core_operation": "string",
  "description": "string",
  "example": "string"
}
```

---

# 15. Excel Notes Sheet 规格

## 15.1 创建时机

```yaml
excel_notes:
  create_when: "用户第一次成功触发保存知识点"
  create_on_addin_open: false
```

## 15.2 位置

```yaml
position:
  required_index: 1
  rule: "Excel Notes 永远应位于 Workbook 的第一个 Sheet"
```

逻辑：

```text
第一次保存
→ 查找 Excel Notes
→ 不存在：创建
→ 移动到第一个位置
→ 初始化表头
→ 写入知识点
```

如果已存在但不在第一位：

```text
保存知识点
→ 识别 Excel Notes
→ 移动到第一位
→ 继续写入
```

## 15.3 Sheet 名称

默认名称：

```text
Excel Notes
```

实现要求：

```yaml
sheet_identification:
  preferred: "不要只依赖可见 Sheet 名称进行识别"
  reason: "用户可能重命名 Sheet"
  implementation_options:
    - "隐藏标记"
    - "Named Item"
    - "固定 Table 名称"
  recommended_table_name: "ExcelTutorNotesTable"
```

## 15.4 表结构

```yaml
notes_table:
  columns:
    - key: "knowledge_point"
      label: "知识点"

    - key: "type"
      label: "类型"

    - key: "core_operation"
      label: "核心操作"

    - key: "description"
      label: "说明"

    - key: "example"
      label: "示例"
```

表格：

| 知识点 | 类型 | 核心操作 | 说明 | 示例 |
|---|---|---|---|---|
| 向下选中连续区域 | Shortcut | Ctrl + Shift + ↓ | 从当前单元格向下选择连续数据区域 | 选中长列表 |
| 多条件求和 | Formula | SUMIFS | 根据多个条件汇总数值 | `=SUMIFS(...)` |

## 15.5 重复项

```yaml
duplicates:
  detect: false
  merge: false
  overwrite: false
  behavior: "每次用户保存都直接新增一行"
```

---

# 16. Chat Session 规格

```yaml
conversation:
  store_in_memory: true
  persist_to_disk: false
  persist_to_cloud: false
  persist_across_workbook_reopen: false
  persist_across_excel_restart: false

  rationale: >
    聊天只是即时学习过程。
    长期有价值的信息应由用户主动保存为 Excel Notes。
```

---

# 17. 状态管理

```yaml
application_state:
  session:
    - "messages"
    - "current worksheet name"
    - "current selected range"
    - "context toggle state"

  local_settings:
    - "DeepSeek API Key"
    - "selected model"

  workbook:
    - "Excel Notes Sheet"
    - "ExcelTutorNotesTable"
```

---

# 18. 错误处理

```yaml
errors:
  no_api_key:
    detection: "发送消息前"
    user_message: "尚未配置 DeepSeek API Key。"
    action: "显示“前往设置”"

  unauthorized_api_key:
    user_message: "DeepSeek API Key 无效，请检查设置。"

  network_error:
    user_message: "网络连接失败，请检查网络后重试。"

  api_timeout:
    user_message: "请求超时，请重试。"

  ai_error:
    user_message: "AI 请求失败，请重试。"

  empty_selection:
    behavior: "允许正常发送问题，不报错"

  oversized_selection:
    behavior:
      - "自动采用摘要/采样上下文"
      - "不阻止用户提问"
    optional_ui_message: "当前选区较大，将仅读取表头和部分样本数据。"

  notes_create_failure:
    user_message: "无法创建 Excel Notes，请检查工作簿是否允许编辑。"

  notes_write_failure:
    user_message: "知识点保存失败，聊天内容未受影响。"

  clipboard_failure:
    user_message: "复制失败。"
```

---

# 19. 安全与隐私要求

```yaml
security:
  workbook_data:
    default_policy: "最小读取"
    whole_workbook_upload: false

  user_control:
    context_toggle: true

  api_key:
    workbook_storage: false
    source_code_hardcode: false

  workbook_mutation:
    allowed:
      - "创建 Excel Notes"
      - "移动 Excel Notes 到第一位"
      - "在 Excel Notes 中追加知识点"
    forbidden:
      - "未经用户操作修改其他 Sheet"
      - "自动写公式到业务 Sheet"
      - "自动创建 Pivot 到业务 Sheet"
      - "自动删除或覆盖用户数据"
```

---

# 20. 功能行为示例

## 20.1 快捷键问题

用户：

```text
怎么快速选中这一列一直到底？
```

期望：

```text
按 Ctrl + Shift + ↓。
```

不期望：

```text
Excel 的连续区域是……
Ctrl 键最早的设计理念是……
下面介绍 5 种选择方式……
```

---

## 20.2 多方法问题

用户：

```text
我想按照部门汇总这些金额，怎么做？
```

期望结构：

```text
可以用：

1. 数据透视表：适合快速分类汇总和随时调整维度。
2. SUMIFS：适合结果需要嵌入固定报表。
3. Power Query：适合数据量较大且处理步骤需要重复执行。

推荐数据透视表。你现在的目标是快速按部门汇总，后续如果想切换统计维度也更方便。

操作：
...
```

---

## 20.3 公式问题

用户：

```text
我要同时按部门和月份求和，用什么？
```

期望：

```text
用 SUMIFS。

格式：

=SUMIFS(求和区域, 部门区域, 部门条件, 日期区域, ">="&开始日期, 日期区域, "<="&结束日期)
```

不需要主动解释如何输入 `=`。

---

## 20.4 保存知识点

当前问答：

```text
用户：怎么快速筛选？
AI：按 Ctrl + Shift + L。
```

点击：

```text
保存知识点
```

写入：

```json
{
  "knowledge_point": "快速开启或关闭筛选",
  "type": "Shortcut",
  "core_operation": "Ctrl + Shift + L",
  "description": "对当前数据区域快速开启或关闭自动筛选。",
  "example": ""
}
```

---

# 21. 验收标准

## 21.1 Ribbon

```yaml
acceptance_ribbon:
  - "Excel 中可见 Excel Tutor Tab"
  - "点击 Open Tutor 可打开 Task Pane"
  - "点击 Settings 可打开设置界面"
```

## 21.2 Tutor

```yaml
acceptance_tutor:
  - "用户可输入自然语言问题并发送"
  - "配置有效 API Key 后可收到 DeepSeek 回复"
  - "默认回复风格简洁"
  - "操作问题优先给键盘方法"
  - "AI 不声称已经替用户执行 Excel 操作"
  - "多方案时可以简要比较并推荐"
```

## 21.3 Context

```yaml
acceptance_context:
  - "界面显示当前 Sheet 和 Selected Range"
  - "使用当前选区默认开启"
  - "用户可关闭"
  - "关闭后不得发送选区数据"
  - "需要上下文时能够读取值和公式"
  - "选区过大时不会上传完整数据"
```

## 21.4 Notes

```yaml
acceptance_notes:
  - "第一次保存知识点时自动创建 Excel Notes"
  - "Excel Notes 位于第一个 Sheet"
  - "Notes 使用固定五列结构"
  - "保存内容是抽象知识点而不是完整聊天"
  - "再次保存时追加新行"
  - "不做重复项去重"
  - "删除 Notes 后再次保存可以重新创建"
```

## 21.5 Conversation

```yaml
acceptance_conversation:
  - "当前使用期间保留聊天上下文"
  - "重启 Excel / 重新打开 Workbook 后不要求恢复聊天"
```

## 21.6 Copy

```yaml
acceptance_copy:
  - "每条 AI 回复下显示复制按钮"
  - "点击后复制当前 AI 回复"
```

---

# 22. 推荐开发顺序

```yaml
implementation_order:
  phase_1:
    name: "Add-in Skeleton"
    tasks:
      - "建立 Office Add-in"
      - "Ribbon"
      - "Task Pane"
      - "Settings UI"

  phase_2:
    name: "AI Chat"
    tasks:
      - "DeepSeek API"
      - "会话状态"
      - "Tutor Prompt"
      - "错误处理"

  phase_3:
    name: "Excel Context"
    tasks:
      - "活动 Sheet"
      - "Selected Range"
      - "Context Toggle"
      - "值与公式读取"
      - "大选区降采样"

  phase_4:
    name: "Notes"
    tasks:
      - "保存知识点按钮"
      - "Note Compiler"
      - "Excel Notes 创建"
      - "移动至第一 Sheet"
      - "Table 初始化"
      - "追加知识点"

  phase_5:
    name: "Polish"
    tasks:
      - "复制功能"
      - "Loading 状态"
      - "错误提示"
      - "边界情况测试"
```

---

# 23. Coding Agent 约束

```yaml
coding_agent_rules:
  - "不得擅自增加 Agent 自动执行能力"
  - "不得擅自增加登录、云端知识库、历史会话系统"
  - "不得擅自实现 VBA / Office Scripts"
  - "不得自动修改 Excel Notes 以外的用户数据"
  - "不得为了“智能化”加入自动保存知识点"
  - "不得把整个 Workbook 默认上传给 AI"
  - "不得把 API Key 写入 Workbook"
  - "不得把 UI 扩展成复杂 Copilot 产品"
  - "优先完成稳定 MVP，而非增加功能"
```

---

# 24. MVP 完成定义

当以下流程完整可用时，MVP 即视为完成：

```text
1. 用户打开 Excel
2. 点击 Excel Tutor → Open Tutor
3. 右侧 Task Pane 打开
4. 用户输入一个 Excel 操作问题
5. AI 返回简洁、Keyboard-first 的指导
6. 用户可以继续追问
7. 用户可以复制某条回答
8. 用户可以点击“保存知识点”
9. 第一次保存时自动创建 Excel Notes
10. Excel Notes 被放在 Workbook 第一个 Sheet
11. 知识点被抽象并追加到五列表格
12. 关闭 Workbook 后不要求恢复聊天
```

达到以上状态后，**停止增加 MVP 功能，进入实际使用测试。**

---

# 25. 产品一句话定义

> **Excel Tutor 是一个嵌入 Microsoft Excel 365 的 Keyboard-first 实战学习工具：用户遇到 Excel 问题时向 AI 提问，AI 只负责告诉用户怎么做，由用户亲自完成；有价值的知识可由用户主动保存并抽象到当前 Workbook 第一个 Sheet 的 Excel Notes 中。**
