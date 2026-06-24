import { useMemo, useState } from "react";
import type { CalcSpec, CalcField, CalcContext } from "../lib/calc";
import { money as fmtMoney, num as fmtNum, regionById, type Region } from "../lib/regions";
import { cn } from "../lib/useLocalStorage";

const toneClass: Record<string, string> = {
  positive: "text-mint",
  negative: "text-coral",
  muted: "text-faint",
  default: "text-ink",
};

function Field({
  field, value, onChange, region,
}: {
  field: CalcField;
  value: string;
  onChange: (v: string) => void;
  region: Region;
}) {
  const base =
    "w-full rounded-yc border border-hairline bg-canvas px-3 py-2.5 text-ink outline-none transition focus:border-coral focus:bg-surface focus:ring-4 focus:ring-coral/10";
  return (
    <label className={cn("block", field.half ? "sm:col-span-1" : "sm:col-span-2")}>
      <span className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-body">
        {field.label}
        {(field.type === "currency" || field.type === "percent") && (
          <span className="font-mono text-[11px] text-faint">
            {field.type === "currency" ? region.symbol : "%"}
          </span>
        )}
      </span>
      {field.type === "select" ? (
        <select className={base} value={value} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          className={base}
          type={field.type === "date" ? "date" : field.type === "text" ? "text" : "number"}
          inputMode={field.type === "number" || field.type === "currency" || field.type === "percent" ? "decimal" : undefined}
          value={value}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.default != null ? String(field.default) : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.help && <span className="mt-1 block text-[11px] text-faint">{field.help}</span>}
    </label>
  );
}

export default function CalculatorTool({
  spec, activeRegion,
}: {
  spec: CalcSpec;
  activeRegion: Region;
}) {
  // Region-specific tools fix their own currency; others follow the app region.
  const region = spec.currency ? regionById(spec.currency) : activeRegion;

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of spec.fields) init[f.key] = f.default != null ? String(f.default) : "";
    return init;
  });

  const ctx: CalcContext = useMemo(
    () => ({
      region,
      money: (v, d) => fmtMoney(v, region, { decimals: d }),
      num: (v, d) => fmtNum(v, region, d),
    }),
    [region],
  );

  const result = useMemo(() => {
    try {
      return spec.compute(values, ctx);
    } catch {
      return { rows: [{ label: "Error", value: "Check your inputs" }] };
    }
  }, [spec, values, ctx]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
      {/* Inputs */}
      <div className="rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-faint">
          Inputs
          {spec.currency && (
            <span className="rounded-full bg-soft px-2 py-0.5 text-[10px] normal-case text-muted">
              {region.flag} {region.currency}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {spec.fields.map((f) => (
            <Field
              key={f.key}
              field={f}
              region={region}
              value={values[f.key] ?? ""}
              onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))}
            />
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="rounded-yc border border-hairline bg-gradient-to-br from-surface to-soft/40 p-5 shadow-sm">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-faint">Result</div>
        <div className="space-y-1">
          {result.rows.map((r, i) => (
            <div
              key={i}
              className={cn(
                "flex items-baseline justify-between gap-3 rounded-lg px-3 py-2.5",
                r.emphasize ? "bg-coral-soft/70" : i % 2 ? "bg-canvas/50" : "",
              )}
            >
              <span className={cn("text-[13px]", r.emphasize ? "font-semibold text-ink" : "text-body")}>
                {r.label}
                {r.hint && <span className="ml-1 text-[11px] text-faint">· {r.hint}</span>}
              </span>
              <span
                className={cn(
                  "shrink-0 font-mono tabular-nums",
                  r.emphasize ? "text-xl font-bold text-coral" : "text-[15px]",
                  !r.emphasize && toneClass[r.tone ?? "default"],
                )}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
        {result.note && (
          <p className="mt-4 rounded-lg bg-soft/60 px-3 py-2 text-[11px] leading-relaxed text-muted">
            {result.note}
          </p>
        )}
      </div>
    </div>
  );
}
