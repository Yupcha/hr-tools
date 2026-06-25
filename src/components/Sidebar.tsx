import { useMemo, useState, type RefObject } from "react";
import { NAV, ALL_TOOLS, type Tool } from "../data/catalog";
import { REGIONS, type RegionId } from "../lib/regions";
import { getIcon } from "../lib/icons";
import { cn, useLocalStorage } from "../lib/useLocalStorage";
import type { Theme } from "../lib/useTheme";
import OfflineBadge from "./OfflineBadge";
import { openExternal, YUPCHA_URL } from "../lib/links";

export default function Sidebar({
  activeId, onSelect, region, onRegion, favorites, onToggleFav,
  theme, onToggleTheme, onOpenPalette, onCollapse, searchRef, mac,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  region: RegionId;
  onRegion: (r: RegionId) => void;
  favorites: string[];
  onToggleFav: (id: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenPalette: () => void;
  onCollapse: () => void;
  searchRef: RefObject<HTMLInputElement | null>;
  mac: boolean;
}) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useLocalStorage<Record<string, boolean>>("hrt.groups", {});
  const Search = getIcon("Search");
  const Moon = getIcon("Moon");
  const Sun = getIcon("Sun");
  const PanelClose = getIcon("PanelLeftClose");

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
  const toggleGroup = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  return (
    <aside className="no-print flex h-full w-[272px] shrink-0 flex-col border-r border-hairline bg-soft/40">
      {/* Brand + quick controls */}
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <button onClick={() => onSelect("")} className="flex items-center gap-2.5 text-left" title="Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-[15px] font-bold text-white shadow-sm">h</div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight text-ink">hr-tools</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-faint">free · offline</div>
          </div>
        </button>
        <div className="ml-auto flex items-center gap-0.5">
          <IconBtn label={theme === "dark" ? "Light mode" : "Dark mode"} onClick={onToggleTheme}>
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </IconBtn>
          <IconBtn label="Collapse sidebar" onClick={onCollapse}>
            <PanelClose size={15} />
          </IconBtn>
        </div>
      </div>

      {/* Search + filter in one: type to filter the list, ⌘K for the full palette */}
      <div className="px-3">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="w-full rounded-yc border border-hairline bg-surface py-2 pl-9 pr-14 text-[13px] text-ink outline-none transition focus:border-coral focus:ring-4 focus:ring-coral/10"
          />
          <button
            type="button"
            onClick={onOpenPalette}
            title="Open command palette"
            aria-label="Open command palette"
            className="absolute right-2 top-1/2 -translate-y-1/2 transition hover:opacity-100 opacity-80"
          >
            <kbd>{mac ? "⌘" : "Ctrl"} K</kbd>
          </button>
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
          <Section id="__results" label={`${results.length} result${results.length === 1 ? "" : "s"}`}>
            {results.map((t) => (
              <ToolRow key={t.id} tool={t} active={activeId === t.id} onSelect={onSelect} fav={favorites.includes(t.id)} onToggleFav={onToggleFav} />
            ))}
            {results.length === 0 && <p className="px-3 py-2 text-[12px] text-faint">No tools match “{query}”.</p>}
          </Section>
        ) : (
          <>
            {favTools.length > 0 && (
              <Section id="__fav" label="Favorites" icon="Star" collapsed={collapsed["__fav"]} onToggle={toggleGroup}>
                {favTools.map((t) => (
                  <ToolRow key={t.id} tool={t} active={activeId === t.id} onSelect={onSelect} fav onToggleFav={onToggleFav} />
                ))}
              </Section>
            )}
            {NAV.map((g) => (
              <Section key={g.id} id={g.id} label={g.label} icon={g.icon} count={g.tools.length} collapsed={collapsed[g.id]} onToggle={toggleGroup}>
                {g.tools.map((t) => (
                  <ToolRow key={t.id} tool={t} active={activeId === t.id} onSelect={onSelect} fav={favorites.includes(t.id)} onToggleFav={onToggleFav} />
                ))}
              </Section>
            ))}
          </>
        )}
      </nav>

      {/* Permanent trust presence — a quiet, settled "Offline · Private" line
          anchored at the foot of the shell. Always visible while the sidebar is
          open; the tool-header badge covers the collapsed case. */}
      <div className="space-y-2 border-t border-hairline px-4 py-2.5">
        <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-muted">
          <button onClick={() => onSelect("about")} className="transition hover:text-ink">About</button>
          <button onClick={() => openExternal(YUPCHA_URL)} className="transition hover:text-coral" title="Visit yupcha.com">
            Powered by Yupcha.com&nbsp;↗
          </button>
        </div>
        <OfflineBadge variant="footer" />
      </div>
    </aside>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-ink"
    >
      {children}
    </button>
  );
}

function Section({
  id, label, icon, count, children, collapsed, onToggle,
}: {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  children: React.ReactNode;
  collapsed?: boolean;
  onToggle?: (id: string) => void;
}) {
  const Icon = icon ? getIcon(icon) : null;
  const Chevron = getIcon("ChevronDown");
  const foldable = !!onToggle;
  const open = !collapsed;
  return (
    <div className="mb-1.5">
      <button
        onClick={() => onToggle?.(id)}
        disabled={!foldable}
        className={cn(
          "flex w-full items-center gap-1.5 px-3 pb-1 pt-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint",
          foldable && "cursor-pointer transition hover:text-muted",
        )}
      >
        {foldable && (
          <Chevron
            size={12}
            className={cn("shrink-0 transition-transform duration-200", open ? "" : "-rotate-90")}
          />
        )}
        {Icon && <Icon size={12} />}
        <span>{label}</span>
        {count != null && <span className="ml-auto font-mono text-[10px] font-normal opacity-70">{count}</span>}
      </button>
      <div className="collapsible" data-open={open ? "true" : "false"}>
        <div>{children}</div>
      </div>
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
