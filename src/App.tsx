import { useCallback, useEffect, useMemo, useState } from "react";

import { askTutor, compileNote, getProxyHealth } from "./lib/api";
import { getContextSnapshot, getSelectionInfo, shouldReadWorkbookContext } from "./lib/context";
import { appendNote } from "./lib/notes";
import type { ChatMessage, SelectionInfo } from "./lib/types";

const initialSelection: SelectionInfo = { worksheetName: "正在读取工作表…", rangeAddress: "" };
const modelStorageKey = "excel-tutor-model";

function newMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content };
}

function previousQuestion(messages: ChatMessage[], messageId: string): string | undefined {
  const index = messages.findIndex((message) => message.id === messageId);
  for (let current = index - 1; current >= 0; current -= 1) {
    if (messages[current].role === "user") return messages[current].content;
  }
  return undefined;
}

async function copyText(content: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content);
    return;
  }
  const input = document.createElement("textarea");
  input.value = content;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  const successful = document.execCommand("copy");
  input.remove();
  if (!successful) throw new Error("复制失败。");
}

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [selection, setSelection] = useState(initialSelection);
  const [contextEnabled, setContextEnabled] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [busyMessageId, setBusyMessageId] = useState<string>();
  const [feedback, setFeedback] = useState<string>();
  const [proxyConfigured, setProxyConfigured] = useState<boolean>();
  const [defaultModel, setDefaultModel] = useState("deepseek-chat");
  const [model, setModel] = useState(() => localStorage.getItem(modelStorageKey) ?? "deepseek-chat");
  const [settingsOpen, setSettingsOpen] = useState(() => new URLSearchParams(window.location.search).get("view") === "settings");

  const refreshSelection = useCallback(async () => {
    try {
      await Office.onReady();
      setSelection(await getSelectionInfo());
    } catch {
      setSelection({ worksheetName: "未连接 Excel", rangeAddress: "" });
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    try {
      const health = await getProxyHealth();
      setProxyConfigured(health.configured);
      setDefaultModel(health.defaultModel);
      setModel((current) => current || health.defaultModel);
    } catch {
      setProxyConfigured(false);
    }
  }, []);

  useEffect(() => {
    void refreshSelection();
    void refreshHealth();
  }, [refreshHealth, refreshSelection]);

  const sendQuestion = useCallback(async () => {
    const question = draft.trim();
    if (!question || isSending) return;
    if (!proxyConfigured) {
      setSettingsOpen(true);
      setFeedback("尚未配置 DeepSeek API Key。请在本地 .env 中配置后重启代理。");
      return;
    }
    const userMessage = newMessage("user", question);
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setDraft("");
    setFeedback(undefined);
    setIsSending(true);
    try {
      const context = contextEnabled && shouldReadWorkbookContext(question) ? await getContextSnapshot() : undefined;
      if (context?.sampled) setFeedback("当前选区较大，将仅读取表头和部分样本数据。");
      const result = await askTutor({ conversation, model, context });
      setMessages((current) => [...current, newMessage("assistant", result.answer_markdown)]);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "AI 请求失败，请重试。");
    } finally {
      setIsSending(false);
      void refreshSelection();
    }
  }, [contextEnabled, draft, isSending, messages, model, proxyConfigured, refreshSelection]);

  const saveNote = useCallback(async (message: ChatMessage) => {
    const question = previousQuestion(messages, message.id);
    if (!question || busyMessageId) return;
    setBusyMessageId(message.id);
    setFeedback(undefined);
    try {
      const note = await compileNote(question, message.content, model);
      await appendNote(note);
      setFeedback("已保存到 Excel Notes。");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "知识点保存失败，聊天内容未受影响。");
    } finally {
      setBusyMessageId(undefined);
    }
  }, [busyMessageId, messages, model]);

  const contextLabel = useMemo(() => [selection.worksheetName, selection.rangeAddress].filter(Boolean).join(" · "), [selection]);

  if (settingsOpen) {
    return <main className="app settings-view">
      <header className="app-header"><div><h1>Settings</h1><p>Excel Tutor</p></div><button className="icon-button" onClick={() => setSettingsOpen(false)} aria-label="返回聊天">←</button></header>
      <section className="settings-card">
        <h2>DeepSeek 本地代理</h2>
        <p className={proxyConfigured ? "status success" : "status error"}>{proxyConfigured ? "已检测到 API Key 配置" : "尚未检测到 API Key 配置"}</p>
        <p>为保护密钥，请在项目根目录的 <code>.env</code> 中设置 <code>DEEPSEEK_API_KEY</code>，随后重启本地代理。</p>
        <label htmlFor="model">Model</label>
        <input id="model" value={model} onChange={(event) => setModel(event.target.value)} onBlur={() => localStorage.setItem(modelStorageKey, model.trim() || defaultModel)} placeholder={defaultModel} />
        <button className="secondary-button" onClick={() => void refreshHealth()}>刷新连接状态</button>
      </section>
    </main>;
  }

  return <main className="app">
    <header className="app-header"><div><h1>Excel Tutor</h1><p title={contextLabel}>{contextLabel}</p></div><button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="打开设置">⚙</button></header>
    <label className="toggle-row"><input type="checkbox" checked={contextEnabled} onChange={(event) => setContextEnabled(event.target.checked)} />使用当前选区</label>
    {feedback && <div className="feedback" role="status">{feedback}</div>}
    <section className="conversation" aria-live="polite">
      {messages.length === 0 && <div className="empty-state">问一个 Excel 操作问题，我会优先提供键盘操作路径。</div>}
      {messages.map((message) => <article key={message.id} className={`message ${message.role}`}>
        <div className="message-label">{message.role === "user" ? "你" : "Excel Tutor"}</div><div className="message-content">{message.content}</div>
        {message.role === "assistant" && <div className="message-actions">
          <button onClick={() => void copyText(message.content).then(() => setFeedback("已复制。")).catch(() => setFeedback("复制失败。"))}>复制</button>
          <button disabled={Boolean(busyMessageId)} onClick={() => void saveNote(message)}>{busyMessageId === message.id ? "保存中…" : "保存知识点"}</button>
        </div>}
      </article>)}
      {isSending && <div className="typing">Excel Tutor 正在思考…</div>}
    </section>
    <form className="composer" onSubmit={(event) => { event.preventDefault(); void sendQuestion(); }}>
      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendQuestion(); } }} placeholder="输入问题……" rows={3} disabled={isSending} />
      <button className="primary-button" type="submit" disabled={isSending || !draft.trim()}>发送</button>
    </form>
  </main>;
}

