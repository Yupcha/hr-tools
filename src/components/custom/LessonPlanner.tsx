import { useMemo, useState } from "react";
import { getIcon } from "../../lib/icons";
import { cn } from "../../lib/useLocalStorage";

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const fmt = (mins: number) => {
  const m = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const ap = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${ap}`;
};

interface Slot { kind: "period" | "break"; label: string; start: number; end: number }

export default function LessonPlanner() {
  const [start, setStart] = useState("08:30");
  const [periodLen, setPeriodLen] = useState(45);
  const [count, setCount] = useState(7);
  const [breakAfter, setBreakAfter] = useState(2);
  const [breakLen, setBreakLen] = useState(15);
  const [lunchAfter, setLunchAfter] = useState(4);
  const [lunchLen, setLunchLen] = useState(40);

  const slots = useMemo<Slot[]>(() => {
    const out: Slot[] = [];
    let t = toMin(start);
    for (let p = 1; p <= count; p++) {
      out.push({ kind: "period", label: `Period ${p}`, start: t, end: t + periodLen });
      t += periodLen;
      if (breakAfter > 0 && p === breakAfter && breakLen > 0) {
        out.push({ kind: "break", label: "Short Break", start: t, end: t + breakLen });
        t += breakLen;
      }
      if (lunchAfter > 0 && p === lunchAfter && lunchLen > 0) {
        out.push({ kind: "break", label: "Lunch", start: t, end: t + lunchLen });
        t += lunchLen;
      }
    }
    return out;
  }, [start, periodLen, count, breakAfter, breakLen, lunchAfter, lunchLen]);

  const endTime = slots.length ? slots[slots.length - 1].end : toMin(start);
  const Printer = getIcon("Printer");
  const numField = "w-full rounded-yc border border-hairline bg-canvas px-3 py-2 text-[13px] text-ink outline-none focus:border-coral focus:bg-surface focus:ring-4 focus:ring-coral/10";

  const Num = ({ label, value, set, min = 0 }: { label: string; value: number; set: (n: number) => void; min?: number }) => (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-body">{label}</span>
      <input type="number" min={min} className={numField} value={value} onChange={(e) => set(parseInt(e.target.value) || 0)} />
    </label>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="no-print space-y-3 rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-body">Day starts at</span>
          <input type="time" className={numField} value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Num label="Period length (min)" value={periodLen} set={setPeriodLen} min={5} />
          <Num label="Number of periods" value={count} set={setCount} min={1} />
          <Num label="Break after period" value={breakAfter} set={setBreakAfter} />
          <Num label="Break length (min)" value={breakLen} set={setBreakLen} />
          <Num label="Lunch after period" value={lunchAfter} set={setLunchAfter} />
          <Num label="Lunch length (min)" value={lunchLen} set={setLunchLen} />
        </div>
        <p className="text-[11px] text-faint">Set “after period” to 0 to skip a break.</p>
      </div>

      <div className="space-y-3">
        <div className="no-print flex items-center justify-between">
          <span className="text-[13px] text-muted">Ends at <strong className="text-ink">{fmt(endTime)}</strong></span>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-yc bg-coral px-3.5 py-2 text-[12px] font-semibold text-white hover:opacity-90">
            <Printer size={15} /> Save PDF
          </button>
        </div>
        <div className="printable overflow-hidden rounded-yc border border-hairline bg-surface shadow-sm">
          <div className="border-b border-hairline bg-soft/50 px-5 py-3 text-[13px] font-bold uppercase tracking-wider text-ink">Daily Timetable</div>
          {slots.map((s, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between border-b border-hairline px-5 py-2.5 text-[13.5px] last:border-0",
                s.kind === "break" ? "bg-ochre/5 text-ochre" : "text-ink",
              )}
            >
              <span className={s.kind === "break" ? "font-semibold" : "font-medium"}>{s.label}</span>
              <span className="font-mono text-[12.5px] tabular-nums text-muted">{fmt(s.start)} – {fmt(s.end)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
