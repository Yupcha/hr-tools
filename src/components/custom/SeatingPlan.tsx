import { useMemo, useState } from "react";
import { getIcon } from "../../lib/icons";
import { exportMonoPdf } from "../../lib/pdf";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  const rnd = new Uint32Array(a.length);
  crypto.getRandomValues(rnd);
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd[i] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SeatingPlan() {
  const [raw, setRaw] = useState("Aarav\nIsabella\nMohammed\nChen\nFatima\nLiam\nPriya\nNoah\nSofia\nKwame\nElena\nYuki");
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(3);
  const [order, setOrder] = useState<string[] | null>(null);

  const names = useMemo(
    () => raw.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean),
    [raw],
  );

  const seats = order ?? names;
  const total = rows * cols;
  const Shuffle = getIcon("Shuffle");
  const Printer = getIcon("Printer");

  const savePdf = () => {
    const cellW = Math.min(Math.max(...names.map((n) => n.length), 5) + 2, 18);
    const grid: string[] = [];
    for (let r = 0; r < rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < cols; c++) {
        const name = seats[r * cols + c];
        row.push((name ?? "—").slice(0, cellW - 1).padEnd(cellW));
      }
      grid.push(row.join(""));
    }
    const body = "Seating Plan\nFront of class / Teacher\n\n" + grid.join("\n\n");
    exportMonoPdf("Seating Plan", body);
  };
  const field = "w-full rounded-yc border border-hairline bg-canvas px-3 py-2 text-[13px] text-ink outline-none focus:border-coral focus:bg-surface focus:ring-4 focus:ring-coral/10";

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="no-print space-y-3 rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-body">Students ({names.length})</span>
          <textarea className={`${field} min-h-[200px] resize-y`} value={raw} placeholder="One name per line…" onChange={(e) => { setRaw(e.target.value); setOrder(null); }} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-body">Rows</span>
            <input type="number" min={1} className={field} value={rows} onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-body">Columns</span>
            <input type="number" min={1} className={field} value={cols} onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))} />
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setOrder(shuffle(names))} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-yc bg-ink px-3 py-2 text-[12px] font-semibold text-canvas hover:opacity-90">
            <Shuffle size={15} /> Shuffle
          </button>
          <button onClick={savePdf} className="inline-flex items-center justify-center gap-1.5 rounded-yc border border-hairline px-3 py-2 text-[12px] font-semibold text-body hover:border-ink/20">
            <Printer size={15} /> PDF
          </button>
        </div>
        {names.length > total && (
          <p className="text-[11px] text-coral">{names.length - total} student(s) won't fit — add rows or columns.</p>
        )}
      </div>

      <div className="printable space-y-3">
        <div className="mx-auto w-fit rounded-full bg-soft px-6 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-faint">Front of class · Teacher</div>
        <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: total }).map((_, i) => {
            const name = seats[i];
            return (
              <div
                key={i}
                className={`flex aspect-[4/3] items-center justify-center rounded-yc border p-2 text-center text-[13px] font-medium ${
                  name ? "border-hairline bg-surface text-ink shadow-sm" : "border-dashed border-hairline bg-canvas/40 text-faint"
                }`}
              >
                {name ?? "empty"}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
