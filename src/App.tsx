import { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ToolView from "./components/ToolView";
import Home from "./components/Home";
import { TOOL_BY_ID, GROUP_BY_TOOL } from "./data/catalog";
import { regionById, type RegionId } from "./lib/regions";
import { getIcon } from "./lib/icons";
import { useLocalStorage, cn } from "./lib/useLocalStorage";

export default function App() {
  const [activeId, setActiveId] = useLocalStorage<string | null>("hrt.active", null);
  const [region, setRegion] = useLocalStorage<RegionId>("hrt.region", "IN");
  const [favorites, setFavorites] = useLocalStorage<string[]>("hrt.favorites", []);
  const [recents, setRecents] = useLocalStorage<string[]>("hrt.recents", []);

  const tool = activeId ? TOOL_BY_ID[activeId] : null;

  const select = (id: string) => {
    setActiveId(id);
    setRecents((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8));
  };

  const toggleFav = (id: string) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  // Stale id safety (e.g. catalog changed between versions).
  useEffect(() => {
    if (activeId && !TOOL_BY_ID[activeId]) setActiveId(null);
  }, [activeId, setActiveId]);

  const Star = getIcon("Star");
  const group = tool ? GROUP_BY_TOOL[tool.id] : null;
  const fav = tool ? favorites.includes(tool.id) : false;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-body">
      <Sidebar
        activeId={activeId}
        onSelect={select}
        region={region}
        onRegion={setRegion}
        favorites={favorites}
        onToggleFav={toggleFav}
      />

      <main className="flex h-full min-w-0 flex-1 flex-col">
        {tool ? (
          <>
            <header className="no-print flex items-center gap-3 border-b border-hairline bg-surface/70 px-6 py-3.5 backdrop-blur">
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

            <div className="scroll flex-1 overflow-y-auto px-6 py-6">
              <p className="no-print mb-5 max-w-3xl text-[14px] leading-relaxed text-muted">{tool.description}</p>
              <ToolView tool={tool} region={regionById(region)} />
            </div>
          </>
        ) : (
          <Home recents={recents} onSelect={select} />
        )}
      </main>
    </div>
  );
}
