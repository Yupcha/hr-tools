import { NAV, ALL_TOOLS, TOOL_BY_ID, type Tool } from "../data/catalog";
import { getIcon } from "../lib/icons";

export default function Home({ recents, onSelect }: { recents: string[]; onSelect: (id: string) => void }) {
  const recentTools = recents.map((id) => TOOL_BY_ID[id]).filter(Boolean) as Tool[];
  const Sparkles = getIcon("Sparkles");

  return (
    <div className="scroll flex-1 overflow-y-auto">
      {/* Hero */}
      <div className="border-b border-hairline bg-gradient-to-br from-coral-soft/50 via-surface to-soft/30 px-8 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1 text-[11px] font-semibold text-muted">
            <Sparkles size={13} className="text-coral" /> Free · Open-source · 100% offline
          </div>
          <h1 className="text-[34px] font-bold leading-tight tracking-tight text-ink">
            Every HR & teaching tool you need, in one tiny app.
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
            Letters, HR emails, payslips, region-aware payroll calculators and classroom tools —
            curated for India, the US, Europe, the Middle East & Africa. Nothing to sign up for,
            nothing leaves your computer.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[12px] font-medium text-muted">
            <Stat n={ALL_TOOLS.length} label="tools" />
            <Stat n={NAV.length} label="categories" />
            <Stat n={5} label="regions" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-8">
        {recentTools.length > 0 && (
          <Block label="Recent">
            <Grid tools={recentTools} onSelect={onSelect} />
          </Block>
        )}

        {NAV.map((g) => {
          const Icon = getIcon(g.icon);
          return (
            <Block key={g.id} label={g.label} icon={<Icon size={16} className="text-coral" />}>
              <Grid tools={g.tools} onSelect={onSelect} />
            </Block>
          );
        })}

        <footer className="mt-6 border-t border-hairline pt-5 text-center text-[12px] text-faint">
          hrToolkit — built for busy recruiters, HR teams and teachers. Estimates only; verify statutory figures locally.
        </footer>
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

function Grid({ tools, onSelect }: { tools: Tool[]; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((t) => {
        const Icon = getIcon(t.icon);
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="group flex h-full flex-col rounded-yc border border-hairline bg-surface p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-coral/30 hover:shadow-md"
          >
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-coral-soft/70 text-coral transition group-hover:scale-110">
              <Icon size={18} />
            </span>
            <span className="text-[14px] font-semibold text-ink">{t.title}</span>
            <span className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-muted">{t.description}</span>
          </button>
        );
      })}
    </div>
  );
}
