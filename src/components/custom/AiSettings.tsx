import { useState } from "react";
import { getIcon } from "../../lib/icons";
import { cn } from "../../lib/useLocalStorage";
import { DEFAULT_MODEL, aiComplete, isDesktop, useAiSettings } from "../../lib/ai";

export default function AiSettings() {
  const [s, setS] = useAiSettings();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const Sparkles = getIcon("Sparkles");
  const Shield = getIcon("ShieldCheck");
  const Check = getIcon("Check");
  const X = getIcon("X");

  const test = async () => {
    setTesting(true);
    setResult(null);
    try {
      const out = await aiComplete({ ...s, enabled: true }, {
        messages: [{ role: "user", content: "Reply with the single word: ready" }],
        maxTokens: 16,
      });
      setResult({ ok: true, msg: out.trim() ? `Connected — model replied “${out.trim().slice(0, 40)}”` : "Connected." });
    } catch (e) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setTesting(false);
    }
  };

  const field =
    "w-full rounded-yc border border-hairline bg-canvas px-3 py-2 text-[13px] text-ink outline-none transition focus:border-coral focus:bg-surface focus:ring-4 focus:ring-coral/10";

  return (
    <div className="max-w-2xl space-y-5">
      {/* On/off + privacy framing */}
      <div className="rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[15px] font-bold text-ink">
              <Sparkles size={17} className="text-coral" /> AI Assist
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", s.enabled ? "bg-mint/15 text-mint" : "bg-soft text-faint")}>
                {s.enabled ? "On" : "Off"}
              </span>
            </div>
            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">
              Optional. hr-tools is <strong>offline by default</strong>. Turn this on to draft and
              extract with a <strong>local model</strong> via Ollama — v2 is strictly local, so
              there is no cloud provider and nothing can leave this machine.
            </p>
          </div>
          <button
            onClick={() => setS((p) => ({ ...p, enabled: !p.enabled }))}
            role="switch"
            aria-checked={s.enabled}
            className={cn("relative h-6 w-11 shrink-0 rounded-full transition", s.enabled ? "bg-coral" : "bg-hairline")}
          >
            <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", s.enabled ? "left-[22px]" : "left-0.5")} />
          </button>
        </div>
      </div>

      {/* Local model config */}
      <div className={cn("rounded-yc border border-hairline bg-surface p-5 shadow-sm transition", !s.enabled && "pointer-events-none opacity-50")}>
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-faint">Local model (Ollama)</div>

        <label className="mb-3 block">
          <span className="mb-1 block text-[12px] font-medium text-body">Model</span>
          <input className={field} value={s.model} onChange={(e) => setS((p) => ({ ...p, model: e.target.value }))} placeholder={DEFAULT_MODEL} />
        </label>

        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-body">Ollama endpoint (this machine only)</span>
          <input className={field} value={s.endpoint} onChange={(e) => setS((p) => ({ ...p, endpoint: e.target.value }))} placeholder="http://localhost:11434" />
          <span className="mt-1 block text-[11px] text-faint">
            Install Ollama and run e.g. <span className="font-mono">ollama pull llama3.1</span>.
            Only <span className="font-mono">localhost</span> / <span className="font-mono">127.0.0.1</span> endpoints
            are accepted — remote URLs are refused by the app.
          </span>
        </label>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={test}
            disabled={!s.enabled || testing}
            className="inline-flex items-center gap-1.5 rounded-yc bg-ink px-3.5 py-2 text-[12px] font-semibold text-canvas transition hover:opacity-90 disabled:opacity-40"
          >
            <Sparkles size={14} /> {testing ? "Testing…" : "Test connection"}
          </button>
          {result && (
            <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", result.ok ? "text-mint" : "text-coral")}>
              {result.ok ? <Check size={14} /> : <X size={14} />} {result.msg}
            </span>
          )}
        </div>
      </div>

      {/* Privacy reassurance */}
      <div className="flex items-start gap-2 rounded-yc border border-hairline bg-soft/40 px-4 py-3 text-[12px] leading-relaxed text-muted">
        <Shield size={15} className="mt-0.5 shrink-0 text-teal" />
        <span>
          Requests are made by the app's Rust backend, not the web layer, and the backend refuses
          any endpoint that isn't this machine — so with AI on or off, your HR data never leaves
          your device. {isDesktop() ? "" : "AI requires the desktop app."}
        </span>
      </div>
    </div>
  );
}
