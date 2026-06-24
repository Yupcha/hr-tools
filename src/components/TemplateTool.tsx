import { useEffect, useMemo, useState } from "react";
import type { TemplateMeta } from "../data/templates";
import { getIcon } from "../lib/icons";
import { cn } from "../lib/useLocalStorage";

type Tone = "formal" | "modern" | "friendly";
const TONES: Tone[] = ["formal", "modern", "friendly"];

/** Replace [Placeholder] tokens with the user's values (or keep the token). */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\[(.*?)\]/g, (_, key) => values[key]?.trim() || `[${key}]`);
}

export default function TemplateTool({ meta }: { meta: TemplateMeta }) {
  const [tone, setTone] = useState<Tone>("formal");
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init: Record<string, string> = {};
    for (const p of meta.placeholders) init[p] = "";
    if (meta.placeholders.includes("Date"))
      init["Date"] = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    setValues(init);
    setTone("formal");
  }, [meta]);

  const text = useMemo(() => fill(meta.templates[tone], values), [meta, tone, values]);
  const filled = meta.placeholders.filter((p) => values[p]?.trim()).length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const Copy = getIcon("Copy");
  const Check = getIcon("Check");
  const Printer = getIcon("Printer");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.85fr)_1.15fr]">
      {/* Inputs */}
      <div className="no-print rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-faint">
            Fields · {filled}/{meta.placeholders.length}
          </span>
        </div>
        <div className="space-y-3">
          {meta.placeholders.map((p) => {
            const multi = /Conditions|Instructions|Agenda|Key Changes|Responsibilities|Details|Description|Terms|Eligibility|Remarks|First Day|Reason/i.test(p);
            const common =
              "w-full rounded-yc border border-hairline bg-canvas px-3 py-2.5 text-[14px] text-ink outline-none transition focus:border-coral focus:bg-surface focus:ring-4 focus:ring-coral/10";
            return (
              <label key={p} className="block">
                <span className="mb-1 block text-[12px] font-medium text-body">{p}</span>
                {multi ? (
                  <textarea
                    className={cn(common, "min-h-[72px] resize-y")}
                    value={values[p] ?? ""}
                    placeholder={`Enter ${p.toLowerCase()}…`}
                    onChange={(e) => setValues((s) => ({ ...s, [p]: e.target.value }))}
                  />
                ) : (
                  <input
                    className={common}
                    value={values[p] ?? ""}
                    placeholder={`Enter ${p.toLowerCase()}…`}
                    onChange={(e) => setValues((s) => ({ ...s, [p]: e.target.value }))}
                  />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-3">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-yc border border-hairline bg-surface p-1">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-[12px] font-semibold capitalize transition",
                  tone === t ? "bg-ink text-canvas" : "text-muted hover:text-ink",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-yc border border-hairline bg-surface px-3.5 py-2 text-[12px] font-semibold text-body transition hover:border-ink/20"
            >
              {copied ? <Check size={15} className="text-mint" /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-yc bg-coral px-3.5 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
            >
              <Printer size={15} /> Save PDF
            </button>
          </div>
        </div>

        <div className="printable rounded-yc border border-hairline bg-surface p-7 shadow-sm md:p-9">
          <pre className="whitespace-pre-wrap break-words font-sans text-[13.5px] leading-relaxed text-ink">
            {text}
          </pre>
          <div className="no-print mt-6 border-t border-hairline pt-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-faint">
            Generated with hrToolkit · free & offline
          </div>
        </div>
      </div>
    </div>
  );
}
