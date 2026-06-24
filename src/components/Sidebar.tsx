import { useMemo, useState } from "react";
import { NAV, ALL_TOOLS, type Tool } from "../data/catalog";
import { REGIONS, type RegionId } from "../lib/regions";
import { getIcon } from "../lib/icons";
import { cn } from "../lib/useLocalStorage";

export default function Sidebar({
  activeId, onSelect, region, onRegion, favorites, onToggleFav,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  region: RegionId;
  onRegion: (r: RegionId) => void;
  favorites: string[];
  onToggleFav: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const Search = getIcon("Search");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return ALL_TOOLS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.keywords ?? "").includes(q),
    );
  }, [query]);

  const favTools = favorites.map((id) => ALL_TOOLS.find((t) => t.id === id)).filter(Boolean) as Tool[];

  return (
    <aside className="no-print flex h-full w-[272px] shrink-0 flex-col border-r border-hairline bg-soft/40">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-[15px] font-bold text-white">h</div>
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight text-ink">hrToolkit</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-faint">free · offline</div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="w-full rounded-yc border border-hairline bg-surface py-2 pl-9 pr-3 text-[13px] text-ink outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/10"
          />
        </div>
      </div>

      {/* Region selector */}
      <div className="px-3 pt-2.5">
        <select
          value={region}
          onChange={(e) => onRegion(e.target.value as RegionId)}
          className="w-full rounded-yc border border-hairline bg-surface px-3 py-2 text-[13px] text-body outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/10"
          title="Currency region for generic calculators"
        >
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>{r.flag} {r.label} · {r.currency}</option>
          ))}
        </select>
      </div>

      {/* Scrollable nav */}
      <nav className="scroll mt-2 flex-1 overflow-y-auto px-2 pb-4">
        {results ? (
          <Section label={`${results.length} result${results.length === 1 ? "" : "s"}`}>
            {results.map((t) => (
              <ToolRow key={t.id} tool={t} active={activeId === t.id} onSelect={onSelect} fav={favorites.includes(t.id)} onToggleFav={onToggleFav} />
            ))}
            {results.length === 0 && <p className="px-3 py-2 text-[12px] text-faint">No tools match “{query}”.</p>}
          </Section>
        ) : (
          <>
            {favTools.length > 0 && (
              <Section label="Favorites" icon="Star">
                {favTools.map((t) => (
                  <ToolRow key={t.id} tool={t} active={activeId === t.id} onSelect={onSelect} fav onToggleFav={onToggleFav} />
                ))}
              </Section>
            )}
            {NAV.map((g) => (
              <Section key={g.id} label={g.label} icon={g.icon} count={g.tools.length}>
                {g.tools.map((t) => (
                  <ToolRow key={t.id} tool={t} active={activeId === t.id} onSelect={onSelect} fav={favorites.includes(t.id)} onToggleFav={onToggleFav} />
                ))}
              </Section>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}

function Section({ label, icon, count, children }: { label: string; icon?: string; count?: number; children: React.ReactNode }) {
  const Icon = icon ? getIcon(icon) : null;
  return (
    <div className="mb-1.5">
      <div className="flex items-center gap-1.5 px-3 pb-1 pt-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">
        {Icon && <Icon size={12} />}
        {label}
        {count != null && <span className="ml-auto font-mono text-[10px] font-normal opacity-70">{count}</span>}
      </div>
      {children}
    </div>
  );
}

function ToolRow({ tool, active, onSelect, fav, onToggleFav }: {
  tool: Tool; active: boolean; onSelect: (id: string) => void; fav: boolean; onToggleFav: (id: string) => void;
}) {
  const Icon = getIcon(tool.icon);
  const Star = getIcon("Star");
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition",
        active ? "bg-surface font-semibold text-ink shadow-sm" : "text-body hover:bg-surface/70",
      )}
    >
      <button onClick={() => onSelect(tool.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <Icon size={15} className={cn("shrink-0", active ? "text-coral" : "text-faint")} />
        <span className="truncate">{tool.title}</span>
      </button>
      <button
        onClick={() => onToggleFav(tool.id)}
        className={cn("shrink-0 transition", fav ? "text-ochre" : "text-transparent group-hover:text-faint hover:!text-ochre")}
        aria-label="Toggle favorite"
      >
        <Star size={13} fill={fav ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
