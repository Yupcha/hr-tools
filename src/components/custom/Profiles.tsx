import { useMemo, useState } from "react";
import { getIcon } from "../../lib/icons";
import { cn } from "../../lib/useLocalStorage";
import {
  COMPANY_FIELDS, PERSON_FIELDS, labelPlaceholder, newProfile, useProfiles,
  type Profile, type ProfileKind,
} from "../../lib/profiles";
import PersonCard from "./PersonCard";
import type { CustomProps } from "../ToolView";

export default function Profiles({ onSelect }: CustomProps) {
  const { profiles, upsert, remove } = useProfiles();
  const [kind, setKind] = useState<ProfileKind>("company");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Profile | null>(null);
  // A person opened (not edited) → show their person-as-hero card.
  const [viewing, setViewing] = useState<Profile | null>(null);

  const Building = getIcon("Building2");
  const Users = getIcon("Users");
  const Search = getIcon("Search");
  const Plus = getIcon("Plus");
  const Trash = getIcon("Trash2");
  const Save = getIcon("Save");
  const X = getIcon("X");
  const ImageIcon = getIcon("Image");

  // Read a chosen logo file into a self-contained data: URL (100% offline).
  const onLogoFile = (file: File | undefined) => {
    if (!file || !editing) return;
    const reader = new FileReader();
    reader.onload = () =>
      setEditing((e) => (e ? { ...e, logo: typeof reader.result === "string" ? reader.result : undefined } : e));
    reader.readAsDataURL(file);
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles
      .filter((p) => p.kind === kind)
      .filter((p) =>
        !q ||
        p.label.toLowerCase().includes(q) ||
        Object.values(p.fields).some((v) => v.toLowerCase().includes(q)),
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [profiles, kind, query]);

  const fieldKeys = kind === "company" ? COMPANY_FIELDS : PERSON_FIELDS;
  const startNew = () => { setViewing(null); setEditing(newProfile(kind)); };

  const save = () => {
    if (!editing || !editing.label.trim()) return;
    upsert(editing);
    setEditing(null);
  };

  // Open a row: people surface their PersonCard; companies go straight to edit.
  const open = (p: Profile) => {
    if (p.kind === "person") { setEditing(null); setViewing(p); }
    else { setViewing(null); setEditing({ ...p, fields: { ...p.fields } }); }
  };
  const edit = (p: Profile) => { setViewing(null); setEditing({ ...p, fields: { ...p.fields } }); };

  const field = "w-full rounded-yc border border-hairline bg-canvas px-3 py-2 text-[13px] text-ink outline-none transition focus:border-coral focus:bg-surface focus:ring-4 focus:ring-coral/10";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_1.2fr]">
      {/* List */}
      <div className="rounded-yc border border-hairline bg-surface p-4 shadow-sm">
        {/* Kind switch */}
        <div className="mb-3 flex rounded-yc border border-hairline bg-canvas p-1">
          {(["company", "person"] as ProfileKind[]).map((k) => {
            const Icon = k === "company" ? Building : Users;
            return (
              <button
                key={k}
                onClick={() => { setKind(k); setEditing(null); setViewing(null); }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold capitalize transition",
                  kind === k ? "bg-ink text-canvas" : "text-muted hover:text-ink",
                )}
              >
                <Icon size={14} /> {k === "company" ? "Companies" : "People"}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search saved…" className={cn(field, "pl-9")} />
        </div>

        <div className="space-y-1">
          {list.length === 0 && (
            <p className="px-1 py-6 text-center text-[12px] text-faint">
              No {kind === "company" ? "companies" : "people"} saved yet.
            </p>
          )}
          {list.map((p) => (
            <div
              key={p.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] transition",
                editing?.id === p.id || viewing?.id === p.id ? "bg-coral-soft text-ink" : "hover:bg-soft/60",
              )}
            >
              <button onClick={() => open(p)} className="min-w-0 flex-1 text-left">
                <span className="block truncate font-medium text-ink">{p.label || "Untitled"}</span>
                <span className="block truncate text-[11.5px] text-faint">
                  {p.fields["Job Title"] || p.fields["HR Name"] || p.fields["Organization Address Line 1"] || "—"}
                </span>
              </button>
              <button onClick={() => remove(p.id)} aria-label="Delete" className="shrink-0 text-transparent transition group-hover:text-faint hover:!text-coral">
                <Trash size={14} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={startNew} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-yc border border-dashed border-hairline px-3 py-2 text-[12px] font-semibold text-muted transition hover:border-coral/40 hover:text-coral">
          <Plus size={15} /> New {kind === "company" ? "company" : "person"}
        </button>
      </div>

      {/* Right panel: PersonCard (view) · Editor · Empty state */}
      {viewing ? (
        <div className="space-y-3">
          <PersonCard
            person={viewing}
            onEdit={edit}
            onLaunch={(toolId, seed) => onSelect?.(toolId, seed)}
          />
          {!onSelect && (
            <p className="rounded-yc border border-dashed border-hairline px-3 py-2 text-center text-[11.5px] text-faint">
              Open Saved Profiles from the workspace to launch these one-tap.
            </p>
          )}
        </div>
      ) : (
      <div className="rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        {editing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-faint">
                {editing.kind === "company" ? "Company" : "Person"} profile
              </span>
              <button onClick={() => setEditing(null)} className="text-faint transition hover:text-ink"><X size={16} /></button>
            </div>

            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-body">{labelPlaceholder(editing.kind)}</span>
              <input
                autoFocus
                className={field}
                value={editing.label}
                placeholder={editing.kind === "company" ? "e.g. Acme Corp" : "e.g. Priya Sharma"}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fieldKeys.map((k) => (
                <label key={k} className="block">
                  <span className="mb-1 block text-[12px] font-medium text-body">{k}</span>
                  <input
                    className={field}
                    value={editing.fields[k] ?? ""}
                    placeholder={`Enter ${k.toLowerCase()}…`}
                    onChange={(e) => setEditing({ ...editing, fields: { ...editing.fields, [k]: e.target.value } })}
                  />
                </label>
              ))}
            </div>

            {editing.kind === "company" && (
              <div className="rounded-yc border border-hairline bg-soft/40 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <ImageIcon size={14} className="shrink-0 text-faint" />
                  <span className="text-[12px] font-medium text-body">Logo</span>
                  <span className="text-[11px] text-faint">· used on PDF letterheads</span>
                </div>
                <div className="flex items-center gap-3">
                  {editing.logo ? (
                    <img
                      src={editing.logo}
                      alt="Company logo"
                      className="h-12 w-12 rounded-yc border border-hairline bg-canvas object-contain p-1"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-yc border border-dashed border-hairline text-faint">
                      <ImageIcon size={18} />
                    </span>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-yc border border-hairline bg-surface px-3 py-1.5 text-[12px] font-semibold text-body transition hover:border-coral/40 hover:text-coral">
                    {editing.logo ? "Replace" : "Add logo"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="sr-only"
                      onChange={(e) => onLogoFile(e.target.files?.[0])}
                    />
                  </label>
                  {editing.logo && (
                    <button
                      type="button"
                      onClick={() => setEditing((e) => (e ? { ...e, logo: undefined } : e))}
                      className="text-[12px] font-semibold text-faint transition hover:text-coral"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setEditing(null)} className="rounded-yc border border-hairline bg-surface px-3.5 py-2 text-[12px] font-semibold text-body transition hover:border-ink/20">
                Cancel
              </button>
              <button onClick={save} disabled={!editing.label.trim()} className="inline-flex items-center gap-1.5 rounded-yc bg-coral px-3.5 py-2 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40">
                <Save size={15} /> Save profile
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center text-muted">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-yc bg-coral-soft text-coral">
              {kind === "company" ? <Building size={22} /> : <Users size={22} />}
            </span>
            <p className="text-[14px] font-semibold text-ink">Saved {kind === "company" ? "companies" : "people"}</p>
            <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-muted">
              Save details once here, then use <strong>“Fill from saved…”</strong> in any letter, email or
              payslip to auto-fill them. Nothing leaves your device.
            </p>
            <button onClick={startNew} className="mt-4 inline-flex items-center gap-1.5 rounded-yc bg-coral px-3.5 py-2 text-[12px] font-semibold text-white transition hover:opacity-90">
              <Plus size={15} /> New {kind === "company" ? "company" : "person"}
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
