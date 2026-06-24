import { useMemo, useState } from "react";
import { getIcon } from "../../lib/icons";
import { cn } from "../../lib/useLocalStorage";

interface Row { id: number; name: string; weight: string; score: string }
let uid = 1;
const row = (name: string, weight: string, score = ""): Row => ({ id: uid++, name, weight, score });

export default function WeightedGrade() {
  const [rows, setRows] = useState<Row[]>([
    row("Assignments", "20", "85"),
    row("Midterm", "30", "72"),
    row("Final Exam", "50", "68"),
  ]);

  const { final, totalWeight, scored } = useMemo(() => {
    let w = 0, ws = 0, sw = 0;
    for (const r of rows) {
      const weight = parseFloat(r.weight) || 0;
      w += weight;
      if (r.score !== "") {
        ws += weight * (parseFloat(r.score) || 0);
        sw += weight;
      }
    }
    return { final: sw ? ws / sw : 0, totalWeight: w, scored: sw };
  }, [rows]);

  const Plus = getIcon("Plus");
  const Trash = getIcon("Trash2");
  const input = "rounded-yc border border-hairline bg-canvas px-3 py-2 text-[13px] text-ink outline-none focus:border-coral focus:bg-surface focus:ring-4 focus:ring-coral/10";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        <div className="mb-3 grid grid-cols-[1fr_90px_90px_36px] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-faint">
          <span>Component</span><span>Weight %</span><span>Score %</span><span />
        </div>
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-[1fr_90px_90px_36px] gap-2">
              <input className={input} value={r.name} placeholder="Component" onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, name: e.target.value } : x))} />
              <input className={cn(input, "text-center")} type="number" value={r.weight} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, weight: e.target.value } : x))} />
              <input className={cn(input, "text-center")} type="number" value={r.score} placeholder="—" onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, score: e.target.value } : x))} />
              <button
                onClick={() => setRows((s) => (s.length > 1 ? s.filter((x) => x.id !== r.id) : s))}
                className="flex items-center justify-center rounded-yc border border-hairline text-faint transition hover:border-coral/40 hover:text-coral"
                aria-label="Remove"
              >
                <Trash size={15} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setRows((s) => [...s, row("", "")])}
          className="mt-3 inline-flex items-center gap-1.5 rounded-yc border border-dashed border-hairline px-3 py-2 text-[12px] font-semibold text-muted transition hover:border-coral hover:text-coral"
        >
          <Plus size={15} /> Add component
        </button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-yc border border-hairline bg-gradient-to-br from-surface to-soft/40 p-6 shadow-sm">
        <div className="font-mono text-6xl font-bold tabular-nums text-coral">{final.toFixed(1)}%</div>
        <div className="mt-1 text-[13px] font-medium text-muted">
          {scored < totalWeight ? "Grade so far" : "Final grade"}
        </div>
        <div
          className={cn(
            "mt-3 rounded-full px-3 py-1 text-[12px]",
            Math.round(totalWeight) === 100 ? "bg-mint/10 text-mint" : "bg-ochre/10 text-ochre",
          )}
        >
          Weights total {totalWeight}%{Math.round(totalWeight) !== 100 ? " (should be 100%)" : ""}
        </div>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-faint">
          Leave a score blank to see the grade you have so far; it weights only the components entered.
        </p>
      </div>
    </div>
  );
}
