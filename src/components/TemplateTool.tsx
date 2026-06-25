import { useCallback, useEffect, useMemo, useState } from "react";
import type { TemplateMeta } from "../data/templates";
import { getIcon } from "../lib/icons";
import { cn } from "../lib/useLocalStorage";
import { useFlash } from "../lib/useFlash";
import { exportTextPdf, type DocCraft } from "../lib/pdf";
import BatchPanel from "./custom/BatchPanel";
import { CARE_CHECKLISTS, TOOL_BY_ID, type Register } from "../data/catalog";
import {
  COMPANY_FIELDS, PERSON_FIELDS, fillMap, matchCount, newProfile, useProfiles,
  type Profile, type ProfileKind,
} from "../lib/profiles";
import { useAiSettings, draftPlaceholders } from "../lib/ai";

type Tone = "formal" | "modern" | "friendly";
const TONES: Tone[] = ["formal", "modern", "friendly"];

/** Replace [Placeholder] tokens with the user's values (or keep the token). */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\[(.*?)\]/g, (_, key) => values[key]?.trim() || `[${key}]`);
}

export default function TemplateTool({
  toolId, meta, prefill, onPrefillConsumed,
}: {
  toolId?: string;
  meta: TemplateMeta;
  prefill?: Record<string, string> | null;
  onPrefillConsumed?: () => void;
}) {
  // F4: emotional register of this moment (warm / careful / neutral).
  const register: Register | undefined = toolId ? TOOL_BY_ID[toolId]?.register : undefined;
  const checklist = toolId ? CARE_CHECKLISTS[toolId] : undefined;
  const careful = register === "careful";
  const warm = register === "warm";

  const [tone, setTone] = useState<Tone>("formal");
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [pdfFlash, flashPdf] = useFlash(); // R3: Save-PDF success pulse
  // R5: in-session "handle with care" ticks (never persisted).
  const [checked, setChecked] = useState<boolean[]>([]);
  // R6: opt-in PDF letterhead + signature (default OFF → byte-identical PDF).
  const { profiles } = useProfiles();
  const [letterhead, setLetterhead] = useState(false);
  // R7: Single (one person) vs Batch / mail-merge (one doc per saved Person).
  const [mode, setMode] = useState<"single" | "batch">("single");

  useEffect(() => {
    const init: Record<string, string> = {};
    for (const p of meta.placeholders) init[p] = "";
    if (meta.placeholders.includes("Date"))
      init["Date"] = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    setValues(init);
    // R4: warm moments open in a friendly tone; careful moments stay formal.
    setTone(warm ? "friendly" : "formal");
    setChecked(checklist ? checklist.map(() => false) : []);
  }, [meta, warm, checklist]);

  const careDone = !checklist || (checked.length === checklist.length && checked.every(Boolean));

  // R1: consume the one-shot person seed — fill ONLY this template's
  // placeholders, never clobber anything the seed doesn't carry.
  useEffect(() => {
    if (!prefill) return;
    setValues((s) => {
      const next = { ...s };
      for (const ph of meta.placeholders) if (prefill[ph]) next[ph] = prefill[ph];
      return next;
    });
    onPrefillConsumed?.();
  }, [prefill, meta, onPrefillConsumed]);

  const text = useMemo(() => fill(meta.templates[tone], values), [meta, tone, values]);
  const filled = meta.placeholders.filter((p) => values[p]?.trim()).length;

  // R6: this template can carry a letterhead only if it names an organization.
  const canLetterhead = meta.placeholders.includes("Organization Name");
  const company = values["Organization Name"]?.trim() || "";
  // Find a saved Company profile (by name) that carries a logo, for the masthead.
  const logoFor = useCallback(
    (name: string) =>
      profiles.find((p) => p.kind === "company" && p.label.trim().toLowerCase() === name.toLowerCase())?.logo,
    [profiles],
  );
  const companyLogo = useMemo(() => (company ? logoFor(company) : undefined), [company, logoFor]);

  // Assemble the opt-in document craft from a set of field values. Shared by the
  // Single preview (`craft`) and Batch (`craftFor`, called per person).
  const buildCraft = useCallback(
    (vals: Record<string, string>): DocCraft | undefined => {
      if (!letterhead || !canLetterhead) return undefined;
      const co = vals["Organization Name"]?.trim();
      if (!co) return undefined;
      const addressLines = ["Organization Address Line 1", "Organization Address Line 2"]
        .map((k) => vals[k]?.trim())
        .filter((v): v is string => !!v);
      const hr = vals["HR Name"]?.trim();
      return {
        letterhead: { company: co, addressLines, logo: logoFor(co) },
        signature: hr ? { name: hr, title: "Human Resources", company: co } : undefined,
      };
    },
    [letterhead, canLetterhead, logoFor],
  );
  const craft = useMemo<DocCraft | undefined>(() => buildCraft(values), [buildCraft, values]);

  // Apply a saved profile: fill only the placeholders this template actually has.
  const applyProfile = (p: Profile) => {
    const map = fillMap(p);
    setValues((s) => {
      const next = { ...s };
      for (const ph of meta.placeholders) if (ph in map) next[ph] = map[ph];
      return next;
    });
  };

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
  const UserIcon = getIcon("FileText");
  const UsersIcon = getIcon("Users");

  return (
    <div className="space-y-5">
      {/* R7: Single vs Batch / mail-merge. Single is the default, unchanged layout;
          Batch generates one document per saved Person from the same template. */}
      <div className="no-print flex w-fit rounded-yc border border-hairline bg-surface p-1">
        {([
          { id: "single", label: "Single", Icon: UserIcon },
          { id: "batch", label: "Batch", Icon: UsersIcon },
        ] as const).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition",
              mode === id ? "bg-ink text-canvas" : "text-muted hover:text-ink",
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {mode === "batch" ? (
        <BatchPanel
          title={meta.title}
          template={meta.templates[tone]}
          placeholders={meta.placeholders}
          shared={values}
          craftFor={canLetterhead ? buildCraft : undefined}
          careful={careful}
        />
      ) : (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.85fr)_1.15fr]">
      {/* Inputs */}
      <div className="no-print rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-faint">
            Fields · {filled}/{meta.placeholders.length}
          </span>
        </div>

        {/* R5: register cue — quiet care panel for sensitive exits, a small warm note for happy moments. */}
        {careful && checklist ? (
          <CarePanel items={checklist} checked={checked} onToggle={(i) => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))} />
        ) : warm ? (
          <WarmNote />
        ) : null}

        <AiDraftBar
          title={meta.title}
          placeholders={meta.placeholders}
          onDraft={(filled) => setValues((s) => ({ ...s, ...filled }))}
        />

        <ProfileBar placeholders={meta.placeholders} values={values} onApply={applyProfile} />

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
          <div className="flex items-center gap-2">
            {canLetterhead && (
              <LetterheadToggle
                on={letterhead}
                onChange={setLetterhead}
                hasLogo={!!companyLogo}
              />
            )}
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-yc border border-hairline bg-surface px-3.5 py-2 text-[12px] font-semibold text-body transition hover:border-ink/20"
            >
              {copied ? <Check size={15} className="text-mint" /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={async () => { if (!careDone) return; await exportTextPdf(meta.title, text, craft); flashPdf(); }}
              disabled={!careDone}
              title={careDone ? undefined : "Run through the handle-with-care checklist first"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-yc px-3.5 py-2 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
                // Careful moments use a quiet ink button, never the coral emphasis.
                careful
                  ? "bg-ink text-canvas hover:opacity-90"
                  : "bg-coral text-white hover:opacity-90",
              )}
            >
              {pdfFlash ? <Check size={15} /> : <Printer size={15} />}
              {pdfFlash ? "Saved" : "Save PDF"}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "printable rounded-yc border bg-surface p-7 shadow-sm md:p-9",
            // Careful moments render a touch quieter — a soft canvas wash and a
            // hairline instead of a hard border. Token-only, both themes.
            careful ? "border-hairline bg-soft/30" : "border-hairline",
          )}
        >
          <pre
            key={tone}
            className="animate-fade whitespace-pre-wrap break-words font-sans text-[13.5px] leading-relaxed text-ink"
          >
            {text}
          </pre>
          <div className="no-print mt-6 border-t border-hairline pt-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-faint">
            Generated with hrToolkit · free & offline
          </div>
        </div>
      </div>
    </div>
      )}
    </div>
  );
}

/** R6: opt-in PDF letterhead toggle. Quiet by default (never coral); when on,
 *  the saved PDF gains a company masthead + signature block. A logo chip shows
 *  when the matching saved Company profile carries one. */
function LetterheadToggle({
  on, onChange, hasLogo,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  hasLogo: boolean;
}) {
  const Stamp = getIcon("Stamp");
  const Image = getIcon("Image");
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      title="Add a company letterhead and signature to the saved PDF"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-yc border px-3 py-2 text-[12px] font-semibold transition",
        on
          ? "border-ink/20 bg-soft text-ink"
          : "border-hairline bg-surface text-muted hover:text-ink",
      )}
    >
      <Stamp size={15} className={on ? "text-ink" : "text-faint"} />
      Letterhead
      {on && hasLogo && <Image size={13} className="text-mint" />}
    </button>
  );
}

/** R5: a quiet "handle with care" checklist for sensitive exit moments.
 *  Deliberately sky/muted — never coral — and gates the Save button until every
 *  item is ticked. Ticks are in-session only and reset when the tool changes. */
function CarePanel({
  items, checked, onToggle,
}: {
  items: string[];
  checked: boolean[];
  onToggle: (i: number) => void;
}) {
  const Shield = getIcon("ShieldCheck");
  const Check = getIcon("Check");
  const done = checked.filter(Boolean).length;
  return (
    <div className="mb-4 rounded-yc border border-sky/30 bg-sky/5 p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <Shield size={15} className="shrink-0 text-sky" />
        <span className="text-[12px] font-semibold text-body">Handle with care</span>
        <span className="ml-auto font-mono text-[11px] tabular-nums text-muted">
          {done}/{items.length}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onToggle(i)}
              aria-pressed={checked[i]}
              className="flex w-full items-start gap-2 text-left text-[12.5px] leading-snug transition"
            >
              <span
                className={cn(
                  "mt-px flex size-4 shrink-0 items-center justify-center rounded border transition",
                  checked[i] ? "border-sky bg-sky/15 text-sky" : "border-hairline text-transparent",
                )}
              >
                <Check size={11} />
              </span>
              <span className={cn(checked[i] ? "text-muted line-through" : "text-body")}>{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A small, tasteful warmth for happy moments (offers, welcomes). One coral note,
 *  no extra emphasis competing with the Save button. */
function WarmNote() {
  const Heart = getIcon("Heart");
  return (
    <div className="mb-4 flex items-center gap-2 rounded-yc border border-coral/30 bg-coral/5 px-3.5 py-2.5">
      <Heart size={14} className="shrink-0 text-coral" />
      <span className="text-[12.5px] text-body">A warm moment — make it feel personal.</span>
    </div>
  );
}

/** "Fill from saved…" — pick a saved Company / Person to auto-fill, or save the
 *  current details as a new profile. Only shows the kinds this template can use. */
function ProfileBar({
  placeholders, values, onApply,
}: {
  placeholders: string[];
  values: Record<string, string>;
  onApply: (p: Profile) => void;
}) {
  const { profiles, upsert } = useProfiles();
  const [saved, setSaved] = useState<ProfileKind | null>(null);

  const Building = getIcon("Building2");
  const Users = getIcon("Users");
  const Save = getIcon("Save");

  // A kind is relevant only if this template has at least one placeholder it fills.
  const probe = (kind: ProfileKind) =>
    matchCount({ id: "", kind, label: "x", fields: Object.fromEntries((kind === "company" ? COMPANY_FIELDS : PERSON_FIELDS).map((k) => [k, "x"])) }, placeholders) > 0;

  const kinds = (["company", "person"] as ProfileKind[]).filter(probe);
  if (kinds.length === 0) return null;

  const saveFrom = (kind: ProfileKind) => {
    const label = (kind === "company" ? values["Organization Name"] : values["Employee Name"] || values["Candidate Name"])?.trim();
    if (!label) {
      setSaved(null);
      return;
    }
    const keys = kind === "company" ? COMPANY_FIELDS : PERSON_FIELDS;
    const fields: Record<string, string> = {};
    for (const k of keys) if (values[k]?.trim()) fields[k] = values[k].trim();
    upsert({ ...newProfile(kind), label, fields });
    setSaved(kind);
    setTimeout(() => setSaved(null), 1600);
  };

  const select = "rounded-yc border border-hairline bg-canvas px-2.5 py-1.5 text-[12.5px] text-ink outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/10";

  return (
    <div className="mb-4 rounded-yc border border-hairline bg-soft/40 p-3">
      <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">Fill from saved</div>
      <div className="flex flex-col gap-2">
        {kinds.map((kind) => {
          const Icon = kind === "company" ? Building : Users;
          const list = profiles.filter((p) => p.kind === kind && matchCount(p, placeholders) > 0);
          const canSave = !!(kind === "company" ? values["Organization Name"] : values["Employee Name"] || values["Candidate Name"])?.trim();
          return (
            <div key={kind} className="flex items-center gap-2">
              <Icon size={15} className="shrink-0 text-faint" />
              <select
                className={cn(select, "min-w-0 flex-1")}
                value=""
                onChange={(e) => {
                  const p = list.find((x) => x.id === e.target.value);
                  if (p) onApply(p);
                }}
                disabled={list.length === 0}
              >
                <option value="">{list.length ? `Choose ${kind}…` : `No saved ${kind === "company" ? "companies" : "people"}`}</option>
                {list.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <button
                onClick={() => saveFrom(kind)}
                disabled={!canSave}
                title={`Save the current ${kind} details as a profile`}
                className="inline-flex shrink-0 items-center gap-1 rounded-yc border border-hairline bg-surface px-2.5 py-1.5 text-[11.5px] font-semibold text-body transition hover:border-coral/40 hover:text-coral disabled:opacity-40"
              >
                <Save size={13} /> {saved === kind ? "Saved" : "Save"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** "Draft with AI" — type a one-line brief, the model fills the placeholders.
 *  Only shown when the user has enabled AI Assist; the app is offline otherwise. */
function AiDraftBar({
  title, placeholders, onDraft,
}: {
  title: string;
  placeholders: string[];
  onDraft: (filled: Record<string, string>) => void;
}) {
  const [ai] = useAiSettings();
  const [brief, setBrief] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const Sparkles = getIcon("Sparkles");

  if (!ai.enabled) return null;

  const run = async () => {
    if (!brief.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const filled = await draftPlaceholders(ai, title, placeholders, brief.trim());
      if (Object.keys(filled).length === 0) setError("The model didn't return any fields — try a more detailed brief.");
      else onDraft(filled);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-4 rounded-yc border border-hairline bg-soft/40 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">
        <Sparkles size={12} className="text-coral" /> Draft with AI
      </div>
      <div className="flex items-center gap-2">
        <input
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="e.g. Offer for Priya Sharma, Senior Engineer at Acme, ₹18L, joins 1 Aug"
          className="min-w-0 flex-1 rounded-yc border border-hairline bg-surface px-3 py-2 text-[12.5px] text-ink outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/10"
        />
        <button
          onClick={run}
          disabled={!brief.trim() || busy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-yc bg-coral px-3 py-2 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          <Sparkles size={14} /> {busy ? "Drafting…" : "Draft"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[11px] text-coral">{error}</p>}
    </div>
  );
}
