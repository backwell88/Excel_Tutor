import type { ChatMessage, ContextSnapshot, Note } from "./types";

const proxyUrl = import.meta.env.VITE_PROXY_URL ?? "http://127.0.0.1:3001";

interface ApiErrorBody {
  message?: string;
}

async function request<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${proxyUrl}${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("无法连接本地代理。请确认已运行 npm run dev。");
  }

  const data = (await response.json().catch(() => ({}))) as ApiErrorBody;
  if (!response.ok) {
    throw new Error(data.message ?? "AI 请求失败，请重试。");
  }
  return data as T;
}

export function getProxyHealth(): Promise<{ configured: boolean; defaultModel: string }> {
  return request("/health");
}

export function askTutor({
  conversation,
  model,
  context,
}: {
  conversation: ChatMessage[];
  model: string;
  context?: ContextSnapshot;
}): Promise<{ answer_markdown: string; used_excel_context: boolean }> {
  return request("/api/tutor", {
    conversation: conversation.map(({ role, content }) => ({ role, content })),
    model,
    excel_context: context,
  });
}

export function compileNote(question: string, answer: string, model: string): Promise<Note> {
  return request("/api/notes", { question, answer, model });
}

