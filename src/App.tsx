import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import ToolView from "./components/ToolView";
import Home from "./components/Home";
import CommandPalette from "./components/CommandPalette";
import OfflineBadge from "./components/OfflineBadge";
import LockScreen from "./components/LockScreen";
import { useVault } from "./lib/lock";
import { TOOL_BY_ID, GROUP_BY_TOOL } from "./data/catalog";
import { regionById, type RegionId } from "./lib/regions";
import { getIcon } from "./lib/icons";
import { useLocalStorage, cn } from "./lib/useLocalStorage";
import { useTheme } from "./lib/useTheme";

export default function App() {
  const [activeId, setActiveId] = useLocalStorage<string | null>("hrt.active", null);
  const [region, setRegion] = useLocalStorage<RegionId>("hrt.region", "IN");
  const [favorites, setFavorites] = useLocalStorage<string[]>("hrt.favorites", []);
  const [recents, setRecents] = useLocalStorage<string[]>("hrt.recents", []);
  // Desktop starts with the sidebar; phones start with the tool area (drawer).
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>(
    "hrt.sidebar",
    typeof window === "undefined" || window.innerWidth >= 768,
  );
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Transient, NON-persisted "person → document" seed. Consumed once by the
  // opened tool, then cleared. This is the whole person-as-hero channel.
  const [prefill, setPrefill] = useState<Record<string, string> | null>(null);

  const { theme, toggle: toggleTheme } = useTheme();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const mac = useMemo(
    () => typeof navigator !== "undefined" && /Mac|iP(hone|ad|od)/.test(navigator.platform),
    [],
  );

  const tool = activeId ? TOOL_BY_ID[activeId] : null;

  // `seed` is an optional one-shot prefill carried into the opened tool. All
  // existing single-arg callers still type-check (seed defaults to undefined).
  const select = (id: string, seed?: Record<string, string>) => {
    setPrefill(seed ?? null);
    // On phones the sidebar is an overlay drawer — close it so the tool shows.
    if (typeof window !== "undefined" && window.innerWidth < 768) setSidebarOpen(false);
    if (!id) {
      setActiveId(null); // home
      return;
    }
    setActiveId(id);
    setRecents((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8));
  };

  const toggleFav = (id: string) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  // Stale id safety (e.g. catalog changed between versions).
  useEffect(() => {
    if (activeId && !TOOL_BY_ID[activeId]) setActiveId(null);
  }, [activeId, setActiveId]);

  // ── Global keyboard shortcuts ──────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);

      // ⌘K / Ctrl+K — command palette (works even while typing)
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      // ⌘\ / Ctrl+\ — collapse sidebar
      if (mod && e.key === "\\") {
        e.preventDefault();
        setSidebarOpen((o) => !o);
        return;
      }
      if (typing) return;
      // "/" — focus the sidebar filter
      if (e.key === "/") {
        e.preventDefault();
        if (!sidebarOpen) setSidebarOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
        return;
      }
      // Esc — close palette, else go home
      if (e.key === "Escape") {
        if (paletteOpen) return; // palette handles its own esc
        if (activeId) setActiveId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, paletteOpen, sidebarOpen, setActiveId, setSidebarOpen]);

  const Star = getIcon("Star");
  const PanelOpen = getIcon("PanelLeftOpen");
  const group = tool ? GROUP_BY_TOOL[tool.id] : null;
  const fav = tool ? favorites.includes(tool.id) : false;

  // App Lock gate — nothing (tools, search, palette) mounts until unlocked.
  const { locked } = useVault();
  if (locked) return <LockScreen />;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-body">
      {sidebarOpen && (
        <>
          {/* Phone: the sidebar floats as a drawer — tap the scrim to dismiss. */}
          <div
            className="no-print fixed inset-0 z-30 bg-ink/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-40 h-full bg-canvas shadow-xl md:static md:z-auto md:bg-transparent md:shadow-none">
            <Sidebar
              activeId={activeId}
              onSelect={select}
              region={region}
              onRegion={setRegion}
              favorites={favorites}
              onToggleFav={toggleFav}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenPalette={() => setPaletteOpen(true)}
              onCollapse={() => setSidebarOpen(false)}
              searchRef={searchRef}
              mac={mac}
            />
          </div>
        </>
      )}

      <main className="relative flex h-full min-w-0 flex-1 flex-col">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            title="Show sidebar  (⌘\\)"
            aria-label="Show sidebar"
            className="no-print absolute left-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-surface text-muted shadow-sm transition hover:text-ink"
          >
            <PanelOpen size={16} />
          </button>
        )}

        {tool ? (
          <>
            <header className={cn("no-print flex items-center gap-3 border-b border-hairline bg-surface/70 py-3.5 pr-4 backdrop-blur sm:pr-6", sidebarOpen ? "pl-4 sm:pl-6 md:pl-6" : "pl-14")}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">
                  {group?.label}
                  {tool.region && (
                    <span className="ml-1 rounded-full bg-soft px-2 py-0.5 text-[10px] normal-case text-muted">
                      {regionById(tool.region).flag} {regionById(tool.region).label}
                    </span>
                  )}
                </div>
                <h1 className="truncate text-[19px] font-bold tracking-tight text-ink">{tool.title}</h1>
              </div>
              <OfflineBadge />
              <button
                onClick={() => toggleFav(tool.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-yc border px-3 py-2 text-[12px] font-semibold transition",
                  fav ? "border-ochre/30 bg-ochre/10 text-ochre" : "border-hairline text-muted hover:border-ink/20",
                )}
              >
                <Star size={14} fill={fav ? "currentColor" : "none"} />
                {fav ? "Saved" : "Save"}
              </button>
            </header>

            <div className="scroll flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
              <p className="no-print mb-5 max-w-3xl text-[14px] leading-relaxed text-muted">{tool.description}</p>
              <ToolView
                tool={tool}
                region={regionById(region)}
                prefill={prefill}
                onPrefillConsumed={() => setPrefill(null)}
                onSelect={select}
              />
            </div>
          </>
        ) : (
          <Home
            recents={recents}
            onSelect={select}
            onOpenPalette={() => setPaletteOpen(true)}
            mac={mac}
          />
        )}
      </main>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelect={select}
        activeId={activeId}
      />
    </div>
  );
}
