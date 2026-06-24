import { useMemo, useState } from "react";
import { getIcon } from "../../lib/icons";
import { cn } from "../../lib/useLocalStorage";

// 4.0-scale grade points (US-style); works for CGPA on a 10-scale too if you
// switch the scale. Kept simple and editable per row.
const GRADES: { label: string; points: number }[] = [
  { label: "A / A+ (4.0)", points: 4.0 },
  { label: "A- (3.7)", points: 3.7 },
  { label: "B+ (3.3)", points: 3.3 },
  { label: "B (3.0)", points: 3.0 },
  { label: "B- (2.7)", points: 2.7 },
  { label: "C+ (2.3)", points: 2.3 },
  { label: "C (2.0)", points: 2.0 },
  { label: "D (1.0)", points: 1.0 },
  { label: "F (0.0)", points: 0.0 },
];

interface Row { id: number; name: string; credits: string; grade: number }
let uid = 1;
const blank = (): Row => ({ id: uid++, name: "", credits: "3", grade: 4.0 });

export default function GpaCalculator() {
  const [rows, setRows] = useState<Row[]>([blank(), blank(), blank()]);

  const { gpa, credits } = useMemo(() => {
    let qp = 0, cr = 0;
    for (const r of rows) {
      const c = parseFloat(r.credits) || 0;
      qp += c * r.grade;
      cr += c;
    }
    return { gpa: cr ? qp / cr : 0, credits: cr };
  }, [rows]);

  const Plus = getIcon("Plus");
  const Trash = getIcon("Trash2");
  const input = "rounded-yc border border-hairline bg-canvas px-3 py-2 text-[13px] text-ink outline-none focus:border-coral focus:bg-surface focus:ring-4 focus:ring-coral/10";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        <div className="mb-3 grid grid-cols-[1fr_80px_140px_36px] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-faint">
          <span>Course</span><span>Credits</span><span>Grade</span><span />
        </div>
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-[1fr_80px_140px_36px] gap-2">
              <input className={input} value={r.name} placeholder="Course name" onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, name: e.target.value } : x))} />
              <input className={cn(input, "text-center")} type="number" min={0} value={r.credits} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, credits: e.target.value } : x))} />
              <select className={input} value={r.grade} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, grade: parseFloat(e.target.value) } : x))}>
                {GRADES.map((g) => <option key={g.label} value={g.points}>{g.label}</option>)}
              </select>
              <button
                onClick={() => setRows((s) => (s.length > 1 ? s.filter((x) => x.id !== r.id) : s))}
                className="flex items-center justify-center rounded-yc border border-hairline text-faint transition hover:border-coral/40 hover:text-coral"
                aria-label="Remove course"
              >
                <Trash size={15} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setRows((s) => [...s, blank()])}
          className="mt-3 inline-flex items-center gap-1.5 rounded-yc border border-dashed border-hairline px-3 py-2 text-[12px] font-semibold text-muted transition hover:border-coral hover:text-coral"
        >
          <Plus size={15} /> Add course
        </button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-yc border border-hairline bg-gradient-to-br from-surface to-soft/40 p-6 shadow-sm">
        <div className="font-mono text-6xl font-bold tabular-nums text-coral">{gpa.toFixed(2)}</div>
        <div className="mt-1 text-[13px] font-medium text-muted">Grade Point Average</div>
        <div className="mt-3 rounded-full bg-soft px-3 py-1 text-[12px] text-body">{credits} total credits</div>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-faint">
          Credit-weighted on a 4.0 scale. For a 10-point CGPA, treat the points column as your institution's scale.
        </p>
      </div>
    </div>
  );
}
