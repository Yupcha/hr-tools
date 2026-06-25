import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_TOOLS, GROUP_BY_TOOL, type Tool } from "../data/catalog";
import { getIcon } from "../lib/icons";
import { cn } from "../lib/useLocalStorage";

const NO_MATCH = Infinity;

/** Subsequence fuzzy match → score (lower is better), or NO_MATCH. Scores may be negative. */
function subseqScore(haystack: string, needle: string): number {
  if (!needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  let hi = 0;
  let score = 0;
  let prev = -1;
  for (let ni = 0; ni < n.length; ni++) {
    const c = n[ni];
    const found = h.indexOf(c, hi);
    if (found === -1) return NO_MATCH;
    // Reward contiguous matches and matches at word starts.
    if (prev !== -1) score += found - prev - 1;
    if (found === 0 || h[found - 1] === " ") score -= 2;
    prev = found;
    hi = found + 1;
  }
  return score;
}

/**
 * Rank a tool against the query. Lower is better; NO_MATCH means filtered out.
 * Title matches dominate (exact substring → best, then fuzzy); group/keywords/
 * description only matter when the title doesn't match.
 */
function rankTool(title: string, group: string, extras: string, needle: string): number {
  const n = needle.toLowerCase();
  const t = title.toLowerCase();

  if (t.includes(n)) return -1000 + t.indexOf(n); // substring in title — strongest
  const titleFuzzy = subseqScore(title, needle);
  if (titleFuzzy !== NO_MATCH) return titleFuzzy; // fuzzy over the title

  // Fall back to group + keywords + description, heavily penalised so any
  // title match always sorts ahead of a mere keyword/description hit.
  const hay = `${group} ${extras}`;
  if (hay.toLowerCase().includes(n)) return 1000;
  const haystackFuzzy = subseqScore(hay, needle);
  return haystackFuzzy !== NO_MATCH ? 5000 + haystackFuzzy : NO_MATCH;
}

export default function CommandPalette({
  open, onClose, onSelect, activeId,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  activeId: string | null;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const Search = getIcon("Search");
  const Enter = getIcon("CornerDownLeft");

  // Rank tools against the query.
  const results = useMemo(() => {
    const q = query.trim();
    if (!q) {
      // No query → recents-ish: keep catalog order, active tool first.
      const list = [...ALL_TOOLS];
      if (activeId) list.sort((a, b) => (a.id === activeId ? -1 : b.id === activeId ? 1 : 0));
      return list.slice(0, 40);
    }
    return ALL_TOOLS.map((t) => ({
      t,
      score: rankTool(t.title, GROUP_BY_TOOL[t.id]?.label ?? "", `${t.keywords ?? ""} ${t.description}`, q),
    }))
      .filter((r) => r.score !== NO_MATCH)
      .sort((a, b) => a.score - b.score)
      .slice(0, 40)
      .map((r) => r.t);
  }, [query, activeId]);

  // Reset when opened.
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      // focus after the open animation frame
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Clamp + keep selection in view.
  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, results.length - 1)));
  }, [results.length]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  const choose = (t: Tool | undefined) => {
    if (!t) return;
    onSelect(t.id);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[cursor]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      onMouseDown={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-yc border border-hairline bg-surface shadow-2xl animate-pop"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        {/* Search */}
        <div className="flex items-center gap-2.5 border-b border-hairline px-4">
          <Search size={17} className="shrink-0 text-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder={`Search ${ALL_TOOLS.length} tools…`}
            className="w-full bg-transparent py-3.5 text-[15px] text-ink outline-none placeholder:text-faint"
          />
          <kbd className="shrink-0">esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="scroll max-h-[52vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13px] text-faint">
              No tools match “{query}”.
            </div>
          ) : (
            results.map((t, i) => {
              const Icon = getIcon(t.icon);
              const group = GROUP_BY_TOOL[t.id]?.label;
              const sel = i === cursor;
              return (
                <button
                  key={t.id}
                  data-idx={i}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => choose(t)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                    sel ? "bg-coral-soft" : "hover:bg-soft/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                      sel ? "bg-coral text-white" : "bg-soft text-faint",
                    )}
                  >
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[13.5px] font-medium", sel ? "text-ink" : "text-body")}>
                      {t.title}
                    </span>
                    <span className="block truncate text-[11.5px] text-faint">{group}</span>
                  </span>
                  {sel && (
                    <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-coral">
                      <Enter size={13} /> open
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-3 border-t border-hairline px-4 py-2 text-[11px] text-faint">
          <span className="flex items-center gap-1.5"><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span className="flex items-center gap-1.5"><kbd>↵</kbd> open</span>
          <span className="ml-auto">{results.length} result{results.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}
