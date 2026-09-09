import "dotenv/config";

import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";

const port = Number(process.env.PORT ?? 3001);
const allowedOrigin = process.env.CLIENT_ORIGIN ?? "https://localhost:5173";
const defaultModel = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
const deepSeekUrl = "https://api.deepseek.com/chat/completions";
const requestTimeoutMs = 45_000;

const tutorSystemPrompt = `You are Excel Tutor, an embedded Excel teacher for users who already know basic Excel.
Teach users how to perform Excel tasks themselves. Prefer keyboard shortcuts and Excel Alt KeyTips. Answer the immediate question with the minimum sufficient instructions. Do not perform, simulate, or claim workbook edits. Avoid business-domain instruction. Use workbook context only when relevant. Keep responses concise and operational.`;

const noteCompilerSystemPrompt = `You compile one reusable Excel knowledge note from a user question and tutor answer. Remove workbook-specific details. Return valid JSON only with knowledge_point, type, core_operation, description, and example. type must be exactly Shortcut, Formula, Operation, Pivot, Power Query, Chart, or Other. example must be a string.`;

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface Note {
  knowledge_point: string;
  type: "Shortcut" | "Formula" | "Operation" | "Pivot" | "Power Query" | "Chart" | "Other";
  core_operation: string;
  description: string;
  example: string;
}

class AppError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: string) {
    super(message);
  }
}

function configuredApiKey(): string {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) throw new AppError("DeepSeek API Key is not configured.", 503, "api_key_missing");
  return apiKey;
}

function normalizeModel(value: unknown): string {
  return typeof value === "string" && /^[a-zA-Z0-9._-]{1,80}$/.test(value) ? value : defaultModel;
}

function sanitizeConversation(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) throw new AppError("Invalid request content.", 400, "invalid_request");
  const messages: ChatMessage[] = value
    .filter((message): message is ChatMessage => typeof message === "object" && message !== null && typeof (message as ChatMessage).content === "string")
    .map(({ role, content }): ChatMessage => ({ role: role === "assistant" ? "assistant" : "user", content: content.trim().slice(0, 8_000) }))
    .filter((message) => message.content.length > 0);
  if (messages.length === 0 || messages.at(-1)?.role !== "user") {
    throw new AppError("A user question is required.", 400, "invalid_request");
  }
  return messages.slice(-20);
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`Missing note field: ${field}.`, 502, "invalid_ai_response");
  }
  return value.trim().slice(0, 2_000);
}

function parseNote(content: string): Note {
  const json = content.replace(/^```json\s*|\s*```$/gim, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new AppError("AI returned invalid note JSON.", 502, "invalid_ai_response");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new AppError("AI returned invalid note JSON.", 502, "invalid_ai_response");
  }
  const note = parsed as Record<string, unknown>;
  const allowedTypes = ["Shortcut", "Formula", "Operation", "Pivot", "Power Query", "Chart", "Other"] as const;
  if (typeof note.type !== "string" || !allowedTypes.includes(note.type as (typeof allowedTypes)[number])) {
    throw new AppError("AI returned an unsupported note type.", 502, "invalid_ai_response");
  }
  return {
    knowledge_point: readString(note.knowledge_point, "knowledge_point"),
    type: note.type as Note["type"],
    core_operation: readString(note.core_operation, "core_operation"),
    description: readString(note.description, "description"),
    example: typeof note.example === "string" ? note.example.trim().slice(0, 2_000) : "",
  };
}

async function complete(messages: Array<{ role: "system" | ChatRole; content: string }>, model: string, jsonMode = false): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(deepSeekUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${configuredApiKey()}` },
      body: JSON.stringify({ model, messages, stream: false, ...(jsonMode ? { response_format: { type: "json_object" } } : {}) }),
      signal: controller.signal,
    });
    if (response.status === 401) throw new AppError("DeepSeek API Key is invalid.", 401, "api_key_invalid");
    if (!response.ok) throw new AppError("AI request failed. Please retry.", 502, "ai_error");
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new AppError("AI did not return an answer.", 502, "invalid_ai_response");
    return content;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AppError("Request timed out. Please retry.", 504, "api_timeout");
    }
    throw new AppError("Network connection failed. Please retry.", 502, "network_error");
  } finally {
    clearTimeout(timeout);
  }
}

const app = express();
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ configured: Boolean(process.env.DEEPSEEK_API_KEY?.trim()), defaultModel });
});

app.post("/api/tutor", async (request, response, next) => {
  try {
    const conversation = sanitizeConversation(request.body.conversation);
    const context = request.body.excel_context;
    const messages: Array<{ role: "system" | ChatRole; content: string }> = [{ role: "system", content: tutorSystemPrompt }, ...conversation];
    if (context && typeof context === "object") {
      messages.push({ role: "user", content: `Current Excel selection context (use only when relevant):\n${JSON.stringify(context).slice(0, 60_000)}` });
    }
    const answer = await complete(messages, normalizeModel(request.body.model));
    response.json({ answer_markdown: answer, used_excel_context: Boolean(context) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/notes", async (request, response, next) => {
  try {
    const question = typeof request.body.question === "string" ? request.body.question.trim().slice(0, 8_000) : "";
    const answer = typeof request.body.answer === "string" ? request.body.answer.trim().slice(0, 16_000) : "";
    if (!question || !answer) throw new AppError("Cannot save an empty note.", 400, "invalid_request");
    const content = await complete([
      { role: "system", content: noteCompilerSystemPrompt },
      { role: "user", content: `User question:\n${question}\n\nTutor answer:\n${answer}` },
    ], normalizeModel(request.body.model), true);
    response.json(parseNote(content));
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  const appError = error instanceof AppError ? error : new AppError("Unexpected server error.", 500, "server_error");
  response.status(appError.status).json({ message: appError.message, code: appError.code });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Excel Tutor local proxy listening on http://127.0.0.1:${port}`);
});