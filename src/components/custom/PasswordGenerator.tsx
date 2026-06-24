import { useCallback, useEffect, useState } from "react";
import { getIcon } from "../../lib/icons";
import { cn } from "../../lib/useLocalStorage";

const SETS = {
  lower: "abcdefghijkmnpqrstuvwxyz",
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  digits: "23456789",
  symbols: "!@#$%^&*-_=+?",
  ambiguous: "il1Lo0O",
};

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true, ambiguous: false });
  const [pw, setPw] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let pool = "";
    if (opts.lower) pool += SETS.lower;
    if (opts.upper) pool += SETS.upper;
    if (opts.digits) pool += SETS.digits;
    if (opts.symbols) pool += SETS.symbols;
    if (opts.ambiguous) pool += SETS.ambiguous;
    if (!pool) { setPw(""); return; }
    const rnd = new Uint32Array(length);
    crypto.getRandomValues(rnd);
    let out = "";
    for (let i = 0; i < length; i++) out += pool[rnd[i] % pool.length];
    setPw(out);
    setCopied(false);
  }, [length, opts]);

  useEffect(() => { generate(); }, [generate]);

  // Rough strength estimate from entropy bits.
  const poolSize =
    (opts.lower ? SETS.lower.length : 0) + (opts.upper ? SETS.upper.length : 0) +
    (opts.digits ? SETS.digits.length : 0) + (opts.symbols ? SETS.symbols.length : 0) +
    (opts.ambiguous ? SETS.ambiguous.length : 0);
  const bits = pw ? Math.round(length * Math.log2(Math.max(2, poolSize))) : 0;
  const strength = bits >= 100 ? { label: "Very strong", tone: "mint" } : bits >= 70 ? { label: "Strong", tone: "mint" } : bits >= 45 ? { label: "Fair", tone: "ochre" } : { label: "Weak", tone: "coral" };

  const Copy = getIcon("Copy");
  const Check = getIcon("Check");
  const Refresh = getIcon("RefreshCw");

  const copy = async () => {
    try { await navigator.clipboard.writeText(pw); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-3 rounded-yc border border-hairline bg-canvas px-4 py-3.5">
          <code className="flex-1 break-all font-mono text-[18px] text-ink">{pw || "—"}</code>
          <button onClick={generate} className="rounded-lg p-2 text-muted transition hover:bg-soft hover:text-ink" aria-label="Regenerate"><Refresh size={18} /></button>
          <button onClick={copy} className="rounded-lg p-2 text-muted transition hover:bg-soft hover:text-ink" aria-label="Copy">{copied ? <Check size={18} className="text-mint" /> : <Copy size={18} />}</button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px]">
          <span className={cn("font-semibold", strength.tone === "mint" ? "text-mint" : strength.tone === "ochre" ? "text-ochre" : "text-coral")}>{strength.label}</span>
          <span className="font-mono text-faint">≈ {bits} bits entropy</span>
        </div>
      </div>

      <div className="rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        <label className="mb-4 block">
          <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-body">
            <span>Length</span>
            <span className="font-mono text-coral">{length}</span>
          </div>
          <input type="range" min={6} max={48} value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full accent-coral" />
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {([
            ["upper", "Uppercase A-Z"],
            ["lower", "Lowercase a-z"],
            ["digits", "Digits 0-9"],
            ["symbols", "Symbols !@#$"],
            ["ambiguous", "Allow look-alikes (il1O0)"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setOpts((o) => ({ ...o, [key]: !o[key] }))}
              className={cn(
                "flex items-center gap-2 rounded-yc border px-3 py-2.5 text-[13px] font-medium transition",
                opts[key] ? "border-coral/40 bg-coral-soft/60 text-ink" : "border-hairline bg-canvas text-muted hover:border-ink/20",
              )}
            >
              <span className={cn("flex h-4 w-4 items-center justify-center rounded border", opts[key] ? "border-coral bg-coral text-white" : "border-hairline")}>
                {opts[key] && <Check size={11} />}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-[11px] text-faint">Generated locally with your device's secure random source. Nothing is sent anywhere.</p>
    </div>
  );
}
