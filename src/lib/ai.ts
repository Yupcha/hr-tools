import { invoke } from "@tauri-apps/api/core";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Optional, opt-in AI assist. hrToolkit is offline by default — AI is OFF until
 * the user turns it on and chooses a backend:
 *   • "ollama"    — a local model (e.g. llama3.1) on localhost; nothing leaves the device.
 *   • "anthropic" — Claude via the user's OWN API key (BYOK); the only path that
 *                   sends data off-device, and only to Anthropic, chosen explicitly.
 * The network call is made in the Rust backend (see src-tauri/src/lib.rs), so the
 * webview CSP stays locked and the key never touches the front-end network layer.
 */
export type AiProvider = "ollama" | "anthropic";

export interface AiSettings {
  enabled: boolean;
  provider: AiProvider;
  model: string;
  apiKey: string; // Anthropic BYOK key, stored on-device only
  endpoint: string; // Ollama base URL
}

export const DEFAULT_MODEL: Record<AiProvider, string> = {
  ollama: "llama3.1",
  anthropic: "claude-opus-4-8",
};

export const DEFAULT_AI: AiSettings = {
  enabled: false,
  provider: "ollama",
  model: DEFAULT_MODEL.ollama,
  apiKey: "",
  endpoint: "http://localhost:11434",
};

export const useAiSettings = () => useLocalStorage<AiSettings>("hrt.ai", DEFAULT_AI);

export const isDesktop = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** Low-level completion. Throws a friendly error if AI is off or unavailable. */
export async function aiComplete(
  s: AiSettings,
  opts: { system?: string; messages: { role: string; content: string }[]; maxTokens?: number },
): Promise<string> {
  if (!s.enabled) throw new Error("AI is off. Turn it on in AI Assist settings.");
  if (!isDesktop()) throw new Error("AI runs only in the hrToolkit desktop app.");
  if (s.provider === "anthropic" && !s.apiKey.trim())
    throw new Error("Add your Anthropic API key in AI Assist settings.");

  return invoke<string>("ai_complete", {
    req: {
      provider: s.provider,
      model: s.model,
      system: opts.system ?? null,
      messages: opts.messages,
      api_key: s.provider === "anthropic" ? s.apiKey : null,
      endpoint: s.provider === "ollama" ? s.endpoint : null,
      max_tokens: opts.maxTokens ?? 2048,
    },
  });
}

/** Pull the first JSON object out of a model response, tolerating code fences/prose. */
function extractJsonObject(raw: string): Record<string, unknown> {
  const fenced = raw.replace(/```(?:json)?/gi, "").trim();
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return {};
  try {
    const parsed = JSON.parse(fenced.slice(start, end + 1));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/**
 * Draft a document from a one-line brief: ask the model to fill the template's
 * placeholders, then keep only the requested keys as trimmed strings.
 */
export async function draftPlaceholders(
  s: AiSettings,
  documentTitle: string,
  placeholders: string[],
  brief: string,
): Promise<Record<string, string>> {
  const system =
    "You fill HR document templates. Given a short brief, reply with ONLY a JSON object " +
    "mapping each requested field name to a concise, professional value. Use an empty " +
    "string for anything the brief doesn't specify. No prose, no code fences, no extra keys.";
  const user =
    `Document: ${documentTitle}\n` +
    `Fields (use exactly these keys): ${JSON.stringify(placeholders)}\n` +
    `Brief: ${brief}`;

  const out = await aiComplete(s, { system, messages: [{ role: "user", content: user }], maxTokens: 1500 });
  const obj = extractJsonObject(out);
  const result: Record<string, string> = {};
  for (const key of placeholders) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) result[key] = v.trim();
    else if (typeof v === "number") result[key] = String(v);
  }
  return result;
}
