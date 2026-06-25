import { useMemo, useState } from "react";
import { getIcon } from "../../lib/icons";
import { cn } from "../../lib/useLocalStorage";
import { useFlash } from "../../lib/useFlash";
import { useProfiles, type Profile } from "../../lib/profiles";
import { buildBatch, batchToText, totalMissing, type BatchRow } from "../../lib/batch";
import { exportTextPdfBatch, type DocCraft } from "../../lib/pdf";

/**
 * Batch / mail-merge (F6). One template → one document per selected saved
 * Person, each auto-filled from their profile via the shared `fillMap`. Values
 * typed once in the Single editor flow through as shared defaults; each
 * person's own fields win. Export every doc as a single paginated PDF or
 * copy-all to the clipboard. Fully offline, token-driven, both themes.
 *
 * Careful moments (sensitive exits) require an explicit CONFIRM gate before the
 * batch can be exported — quiet sky/ochre cues, never coral.
 */
export default function BatchPanel({
  title,
  template,
  placeholders,
  shared,
  craftFor,
  careful,
}: {
  /** Document title (for the PDF filename). */
  title: string;
  /** The active tone's template string. */
  template: string;
  /** This template's placeholders. */
  placeholders: string[];
  /** Values typed once in the Single editor — shared defaults for everyone. */
  shared: Record<string, string>;
  /** Build the opt-in letterhead/signature craft for a person's filled values. */
  craftFor?: (values: Record<string, string>) => DocCraft | undefined;
  /** This is a sensitive moment → require a CONFIRM gate before export. */
  careful?: boolean;
}) {
  const { profiles } = useProfiles();
  const people = useMemo(
    () => profiles.filter((p) => p.kind === "person").sort((a, b) => a.label.localeCompare(b.label)),
    [profiles],
  );

  // In-session only: which people are in this batch run, and the careful gate.
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState("");
  const [copied, setCopied] = useState(false);
  const [pdfFlash, flashPdf] = useFlash();

  const Users = getIcon("Users");
  const Check = getIcon("Check");
  const Copy = getIcon("Copy");
  const Printer = getIcon("Printer");
  const Alert = getIcon("ShieldCheck");

  const chosen = useMemo(
    () => people.filter((p) => selected.includes(p.id)),
    [people, selected],
  );
  const rows = useMemo<BatchRow[]>(
    () => buildBatch(template, placeholders, chosen, shared),
    [template, placeholders, chosen, shared],
  );
  const missing = totalMissing(rows);
  const confirmed = !careful || confirm.trim().toUpperCase() === "CONFIRM";
  const canExport = rows.length > 0 && confirmed;

  const toggle = (p: Profile) =>
    setSelected((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]));
  const allSelected = people.length > 0 && selected.length === people.length;
  const toggleAll = () =>
    setSelected(allSelected ? [] : people.map((p) => p.id));

  const copyAll = async () => {
    if (!canExport) return;
    try {
      await navigator.clipboard.writeText(batchToText(rows));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const exportAll = async () => {
    if (!canExport) return;
    await exportTextPdfBatch(`${title} — batch`, rows.map((r) => ({
      title: r.person.label || title,
      body: r.body,
      craft: craftFor?.(r.values),
    })));
    flashPdf();
  };

  if (people.length === 0) {
    return (
      <div className="rounded-yc border border-dashed border-hairline bg-surface p-8 text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-yc bg-soft text-faint">
          <Users size={20} />
        </span>
        <p className="text-[14px] font-semibold text-ink">No saved people yet</p>
        <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-muted">
          Batch / mail-merge generates one document per saved Person. Add people in
          <strong> Saved Profiles</strong> first, then come back to run them all at once.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_1.2fr]">
      {/* Recipient picker */}
      <div className="no-print rounded-yc border border-hairline bg-surface p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-faint">
            Recipients · {selected.length}/{people.length}
          </span>
          <button
            onClick={toggleAll}
            className="text-[11.5px] font-semibold text-muted transition hover:text-coral"
          >
            {allSelected ? "Clear all" : "Select all"}
          </button>
        </div>

        <div className="space-y-1">
          {people.map((p) => {
            const on = selected.includes(p.id);
            const sub = [p.fields["Job Title"], p.fields["Department"]].filter(Boolean).join(" · ");
            return (
              <button
                key={p.id}
                onClick={() => toggle(p)}
                aria-pressed={on}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition",
                  on ? "bg-coral-soft text-ink" : "hover:bg-soft/60",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border transition",
                    on ? "border-coral bg-coral text-white" : "border-hairline text-transparent",
                  )}
                >
                  <Check size={11} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">{p.label || "Untitled"}</span>
                  {sub && <span className="block truncate text-[11.5px] text-faint">{sub}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Run summary + actions + per-person preview */}
      <div className="space-y-3">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <div className="text-[12.5px] text-muted">
            {rows.length === 0 ? (
              "Pick people on the left to build the batch."
            ) : (
              <span className="font-mono tabular-nums">
                {rows.length} document{rows.length === 1 ? "" : "s"}
                {missing > 0 && (
                  <span className="ml-2 rounded-full bg-ochre/15 px-2 py-0.5 text-[11px] font-semibold text-ochre">
                    {missing} field{missing === 1 ? "" : "s"} still blank
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyAll}
              disabled={!canExport}
              className="inline-flex items-center gap-1.5 rounded-yc border border-hairline bg-surface px-3.5 py-2 text-[12px] font-semibold text-body transition hover:border-ink/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <Check size={15} className="text-mint" /> : <Copy size={15} />}
              {copied ? "Copied all" : "Copy all"}
            </button>
            <button
              onClick={exportAll}
              disabled={!canExport}
              title={confirmed ? undefined : "Type CONFIRM to export this sensitive batch"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-yc px-3.5 py-2 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
                careful ? "bg-ink text-canvas hover:opacity-90" : "bg-coral text-white hover:opacity-90",
              )}
            >
              {pdfFlash ? <Check size={15} /> : <Printer size={15} />}
              {pdfFlash ? "Saved" : `Save ${rows.length || ""} PDF${rows.length === 1 ? "" : "s"}`.trim()}
            </button>
          </div>
        </div>

        {/* Careful gate — quiet, never coral. */}
        {careful && rows.length > 0 && (
          <div className="no-print flex items-center gap-2.5 rounded-yc border border-sky/30 bg-sky/5 p-3">
            <Alert size={15} className="shrink-0 text-sky" />
            <span className="text-[12.5px] text-body">
              Sensitive batch — type <span className="font-mono font-semibold text-ink">CONFIRM</span> to enable export.
            </span>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="CONFIRM"
              className="ml-auto w-28 rounded-yc border border-hairline bg-canvas px-2.5 py-1.5 font-mono text-[12px] uppercase tracking-wider text-ink outline-none focus:border-sky focus:ring-4 focus:ring-sky/10"
            />
          </div>
        )}

        {rows.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-yc border border-dashed border-hairline bg-surface text-[13px] text-faint">
            Each selected person becomes one auto-filled page.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.person.id}
                className="printable rounded-yc border border-hairline bg-surface p-5 shadow-sm"
              >
                <div className="no-print mb-2.5 flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-bold text-ink">{r.person.label || "Untitled"}</span>
                  {r.missing.length > 0 && (
                    <span
                      title={`Blank: ${r.missing.join(", ")}`}
                      className="shrink-0 rounded-full bg-ochre/15 px-2 py-0.5 text-[11px] font-semibold text-ochre"
                    >
                      {r.missing.length} blank
                    </span>
                  )}
                </div>
                <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words font-sans text-[12.5px] leading-relaxed text-ink">
                  {r.body}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
