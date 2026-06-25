import { useMemo, useState } from "react";
import { ALL_TOOLS, TOOL_BY_ID, type Tool } from "../data/catalog";
import { STAGES, STAGE_BY_ID, stageTools, type Stage } from "../data/lifecycle";
import { getIcon } from "../lib/icons";
import { cn } from "../lib/useLocalStorage";
import { useProfiles } from "../lib/profiles";
import { REGIONS } from "../lib/regions";
import PersonCard from "./custom/PersonCard";

/**
 * Person-as-hero home. The app is reframed from "a drawer of 59 tools" into a
 * workspace organized around a PERSON and the lifecycle moments they pass
 * through: Hire → Onboard → Pay → Manage → Exit → Teach.
 *
 * FIRST RUN (no saved people, no recents) — a calm, guided start: three big
 * lifecycle choices (one per audience — Hire / Pay / Teach), the fastest way in
 * (⌘K / search), and the full 59-tool catalog tucked behind one disclosure so a
 * first-timer is never confronted with a wall of tools. Keyboard-first pros lose
 * nothing — ⌘K and the sidebar work exactly as before.
 *
 * RETURNING (has people or recents) — the person-as-hero cards, recents, and the
 * full lifecycle map are surfaced straight away.
 */
export default function Home({
  recents, onSelect, onOpenPalette, mac,
}: {
  recents: string[];
  onSelect: (id: string, seed?: Record<string, string>) => void;
  onOpenPalette: () => void;
  mac: boolean;
}) {
  const { profiles } = useProfiles();
  const people = useMemo(() => profiles.filter((p) => p.kind === "person"), [profiles]);
  const recentTools = recents.map((id) => TOOL_BY_ID[id]).filter(Boolean) as Tool[];

  // A first-timer has saved nobody and opened nothing yet. For them the catalog
  // recedes behind ⌘K / "Browse all" so the first screen stays calm.
  const firstRun = people.length === 0 && recentTools.length === 0;

  const Sparkles = getIcon("Sparkles");
  const Shield = getIcon("ShieldCheck");
  const Users = getIcon("Users");

  return (
    <div className="scroll flex-1 overflow-y-auto">
      {/* Hero — the north star */}
      <div className="border-b border-hairline px-8 py-9">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-faint">
            <Shield size={13} className="text-mint" /> Free · Open-source · 100% offline
          </div>
          <h1 className="text-[26px] font-bold leading-[1.2] tracking-tight text-ink">
            Turn a person into any document or number — in two minutes.
          </h1>
          <p className="mt-2.5 max-w-2xl text-[14.5px] leading-relaxed text-muted">
            A calm, private desk assistant for HR teams, recruiters and teachers.
            Save a person once, then move them through their lifecycle — Hire,
            Onboard, Pay, Manage, Exit, Teach. Nothing leaves your computer.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[12px] font-medium text-muted">
            <Stat n={ALL_TOOLS.length} label="tools" />
            <Stat n={STAGES.length} label="lifecycle moments" />
            <Stat n={REGIONS.length} label="regions" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-8">
        {firstRun ? (
          <FirstRun onSelect={onSelect} onOpenPalette={onOpenPalette} mac={mac} sparkles={<Sparkles size={16} className="text-coral" />} />
        ) : (
          <>
            {/* People (hero) */}
            {people.length > 0 && (
              <Block label="Your people" icon={<Users size={16} className="text-coral" />}>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {people.slice(0, 4).map((p) => (
                    <PersonCard
                      key={p.id}
                      person={p}
                      onLaunch={(toolId, seed) => onSelect(toolId, seed)}
                      onEdit={() => onSelect("profiles")}
                    />
                  ))}
                </div>
                {people.length > 4 && (
                  <button
                    onClick={() => onSelect("profiles")}
                    className="mt-3 text-[12.5px] font-semibold text-coral hover:underline"
                  >
                    See all {people.length} people →
                  </button>
                )}
              </Block>
            )}

            {/* First step for returning users who have recents but no people yet. */}
            {people.length === 0 && (
              <Block label="Start with a person">
                <button
                  onClick={() => onSelect("profiles")}
                  className="group flex w-full items-center gap-3 rounded-yc border border-dashed border-coral/40 bg-coral-soft/30 px-4 py-3.5 text-left transition hover:bg-coral-soft/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-coral">
                    <Users size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-ink">Save your first person</span>
                    <span className="block text-[12.5px] text-muted">Then create every letter, payslip and number about them in one tap.</span>
                  </span>
                  <span className="shrink-0 font-mono text-[18px] text-coral transition group-hover:translate-x-0.5">→</span>
                </button>
              </Block>
            )}

            {recentTools.length > 0 && (
              <Block label="Recent">
                <Grid tools={recentTools} onSelect={onSelect} />
              </Block>
            )}

            {/* Lifecycle map — every tool reachable, grouped by moment */}
            <Block label="The lifecycle" icon={<Sparkles size={16} className="text-coral" />}>
              <LifecycleMap onSelect={onSelect} defaultOpen={STAGES[0].id} />
            </Block>
          </>
        )}

        <footer className="mt-6 border-t border-hairline pt-5 text-center text-[12px] text-faint">
          hr-tools — a calm, private desk assistant. Estimates only; verify statutory figures locally.
        </footer>
      </div>
    </div>
  );
}

/**
 * Guided first-run: three big lifecycle choices (one per audience), the fastest
 * way in (⌘K / search), and the full 59-tool catalog behind a single disclosure.
 * The 59 tools recede — they are never gone, just one keystroke or one click away.
 */
function FirstRun({
  onSelect, onOpenPalette, mac, sparkles,
}: {
  onSelect: (id: string, seed?: Record<string, string>) => void;
  onOpenPalette: () => void;
  mac: boolean;
  sparkles: React.ReactNode;
}) {
  const [browse, setBrowse] = useState(false);
  const ChevronDown = getIcon("ChevronDown");
  const Search = getIcon("Search");

  // The three calm entry points — one per audience. Each opens that lifecycle
  // moment's tools inline (progressive disclosure), not a wall of 59.
  const bigChoices: { stage: string; line: string }[] = [
    { stage: "hire", line: "Job descriptions, interview & offer letters." },
    { stage: "pay", line: "Payslips, take-home and payroll across every supported region." },
    { stage: "teach", line: "Grades, attendance, lesson & seating plans." },
  ];

  return (
    <>
      <Block label="What brings you in today?" icon={sparkles}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {bigChoices.map(({ stage, line }) => {
            const s = STAGE_BY_ID[stage];
            if (!s) return null;
            const Icon = getIcon(s.icon);
            const count = stageTools(s).length;
            return (
              <BigChoice key={stage} stage={s} line={line} count={count} Icon={Icon} onSelect={onSelect} />
            );
          })}
        </div>

        {/* The fastest way in — keeps keyboard-first pros at full speed. */}
        <button
          onClick={onOpenPalette}
          className="group mt-3 flex w-full items-center gap-3 rounded-yc border border-hairline bg-surface px-4 py-3 text-left shadow-sm transition hover:border-coral/30"
        >
          <Search size={16} className="shrink-0 text-faint group-hover:text-coral" />
          <span className="min-w-0 flex-1 text-[13px] text-muted">
            Know what you need? <span className="font-semibold text-body">Search all {ALL_TOOLS.length} tools</span>
          </span>
          <kbd className="shrink-0 rounded-md border border-hairline bg-soft px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-muted">
            {mac ? "⌘K" : "Ctrl K"}
          </kbd>
        </button>
      </Block>

      {/* The full catalog — present, but one calm click away. */}
      <section className="mb-7">
        <button
          onClick={() => setBrowse((b) => !b)}
          className="flex w-full items-center gap-2 rounded-yc px-1 py-1 text-[13px] font-bold uppercase tracking-wider text-faint transition hover:text-muted"
        >
          <ChevronDown size={15} className={cn("transition-transform duration-200", browse ? "" : "-rotate-90")} />
          {browse ? "Hide" : "Browse"} the full lifecycle
          <span className="font-mono text-[11px] tabular-nums text-faint">({ALL_TOOLS.length})</span>
        </button>
        <div className="collapsible" data-open={browse ? "true" : "false"}>
          <div className="pt-3">
            <LifecycleMap onSelect={onSelect} defaultOpen="" />
          </div>
        </div>
      </section>
    </>
  );
}

/** One of the three big first-run lifecycle choices — expands its tools inline. */
function BigChoice({
  stage, line, count, Icon, onSelect,
}: {
  stage: Stage;
  line: string;
  count: number;
  Icon: ReturnType<typeof getIcon>;
  onSelect: (id: string, seed?: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("rounded-yc border bg-surface transition", open ? "border-coral/40 sm:col-span-3" : "border-hairline hover:-translate-y-0.5 hover:border-coral/25 hover:shadow-md")}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full flex-col p-4 text-left">
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-soft text-coral">
          <Icon size={20} />
        </span>
        <span className="flex items-center gap-1.5 text-[15px] font-bold text-ink">
          {stage.label}
          <span className="font-mono text-[11px] font-medium tabular-nums text-faint">{count}</span>
        </span>
        <span className="mt-1 text-[12.5px] leading-snug text-muted">{line}</span>
      </button>
      {open && (
        <div className="border-t border-hairline p-3">
          <Grid tools={stageTools(stage)} onSelect={onSelect} />
        </div>
      )}
    </div>
  );
}

/** The full lifecycle map — six collapsible moments covering all 59 tools. */
function LifecycleMap({
  onSelect, defaultOpen,
}: {
  onSelect: (id: string, seed?: Record<string, string>) => void;
  defaultOpen: string;
}) {
  const [openStage, setOpenStage] = useState<string>(defaultOpen);
  return (
    <div className="space-y-2">
      {STAGES.map((s) => (
        <StagePanel
          key={s.id}
          stage={s}
          open={openStage === s.id}
          onToggle={() => setOpenStage((cur) => (cur === s.id ? "" : s.id))}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

/** A collapsible lifecycle moment with its tools. */
function StagePanel({
  stage, open, onToggle, onSelect,
}: {
  stage: Stage;
  open: boolean;
  onToggle: () => void;
  onSelect: (id: string, seed?: Record<string, string>) => void;
}) {
  const Icon = getIcon(stage.icon);
  const Chevron = getIcon("ChevronDown");
  const tools = stageTools(stage);
  return (
    <div className="overflow-hidden rounded-yc border border-hairline bg-surface">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-soft/40"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-coral-soft/70 text-coral">
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-ink">{stage.label}</span>
          <span className="block truncate text-[12.5px] text-muted">{stage.blurb}</span>
        </span>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-faint">{tools.length}</span>
        <Chevron size={16} className={cn("shrink-0 text-faint transition-transform duration-200", open ? "" : "-rotate-90")} />
      </button>
      <div className="collapsible" data-open={open ? "true" : "false"}>
        <div className="border-t border-hairline p-3">
          <Grid tools={tools} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
}

const Stat = ({ n, label }: { n: number; label: string }) => (
  <span className="rounded-full bg-surface px-3 py-1 shadow-sm">
    <strong className="text-ink">{n}</strong> {label}
  </span>
);

function Block({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-faint">
        {icon} {label}
      </h2>
      {children}
    </section>
  );
}

function Grid({
  tools, onSelect,
}: {
  tools: Tool[];
  onSelect: (id: string, seed?: Record<string, string>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((t) => {
        const Icon = getIcon(t.icon);
        const careful = t.register === "careful";
        const warm = t.register === "warm";
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={cn(
              "group flex h-full flex-col rounded-yc border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md",
              // Resting state is quiet; accent only hints on hover.
              careful ? "border-hairline hover:border-sky/30" : "border-hairline hover:border-coral/25",
            )}
          >
            <span
              className={cn(
                "mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-soft text-faint transition",
                careful ? "group-hover:text-sky" : "group-hover:text-coral",
              )}
            >
              <Icon size={18} />
            </span>
            <span className="text-[14px] font-semibold text-ink">{t.title}</span>
            <span className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-muted">{t.description}</span>
            {careful ? (
              <span className="mt-2 text-[10.5px] font-semibold uppercase tracking-wider text-sky">Handle with care</span>
            ) : warm ? (
              <span className="mt-2 text-[10.5px] font-semibold uppercase tracking-wider text-coral">A warm moment</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
