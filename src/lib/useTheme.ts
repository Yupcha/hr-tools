import { useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Theme = "light" | "dark";

/**
 * App theme — persisted on-device, OS-aware on first run, no flash (the initial
 * class is set by an inline script in index.html before React mounts).
 */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme | null>("hrt.theme", null);

  // Resolve the effective theme: explicit choice, else the OS preference.
  const resolved: Theme =
    theme ??
    (typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  // Keep the <html> class in sync with the resolved theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  // While the user hasn't chosen, follow live OS changes.
  useEffect(() => {
    if (theme != null) return;
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = () =>
      document.documentElement.classList.toggle("dark", mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const toggle = useCallback(
    () => setTheme(resolved === "dark" ? "light" : "dark"),
    [resolved, setTheme],
  );

  return { theme: resolved, toggle };
}
