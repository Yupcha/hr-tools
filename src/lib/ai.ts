import { invoke } from "@tauri-apps/api/core";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Opt-in AI assist — strictly local in v2. The only backend is an Ollama model
 * running on this machine; the Rust command additionally refuses any endpoint
 * that is not loopback (see src-tauri/src/lib.rs), so HR data cannot leave the
 * device through this feature even if the stored settings are tampered with.
 * The v1 cloud provider (Anthropic BYOK) was removed in 2.0.0.
 */
export interface AiSettings {
  enabled: boolean;
  model: string;
  endpoint: string; // Ollama base URL — loopback only, enforced in Rust
}

export const DEFAULT_MODEL = "llama3.1";

export const DEFAULT_AI: AiSettings = {
  enabled: false,
  model: DEFAULT_MODEL,
  endpoint: "http://localhost:11434",
};

const AI_KEY = "hrt.ai";

/** v1 records carried a cloud provider and a BYOK API key. Scrub the key and
 *  collapse the record to what v2 can honour; cloud users drop back to "off". */
function migrateV1() {
  try {
    const raw = localStorage.getItem(AI_KEY);
    if (!raw) return;
    const v1 = JSON.parse(raw) as Partial<AiSettings> & { provider?: string; apiKey?: string };
    if (v1.provider === undefined && v1.apiKey === undefined) return;
    const wasCloud = v1.provider === "anthropic";
    const v2: AiSettings = {
      enabled: !wasCloud && Boolean(v1.enabled),
      model: !wasCloud && v1.model ? v1.model : DEFAULT_MODEL,
      endpoint: typeof v1.endpoint === "string" && v1.endpoint.trim() ? v1.endpoint : DEFAULT_AI.endpoint,
    };
    localStorage.setItem(AI_KEY, JSON.stringify(v2));
  } catch {
    /* corrupted or unavailable storage — the hook falls back to defaults */
  }
}
if (typeof window !== "undefined") migrateV1();

export const useAiSettings = () => useLocalStorage<AiSettings>(AI_KEY, DEFAULT_AI);

export const isDesktop = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** Low-level completion. Throws a friendly error if AI is off or unavailable. */
export async function aiComplete(
  s: AiSettings,
  opts: { system?: string; messages: { role: string; content: string }[]; maxTokens?: number },
): Promise<string> {
  if (!s.enabled) throw new Error("AI is off. Turn it on in AI Assist settings.");
  if (!isDesktop()) throw new Error("AI runs only in the hr-tools desktop app.");

  return invoke<string>("ai_complete", {
    req: {
      model: s.model,
      system: opts.system ?? null,
      messages: opts.messages,
      endpoint: s.endpoint,
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
