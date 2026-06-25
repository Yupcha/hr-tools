/** Brand + external links. The app is offline-first; these open the user's
 *  system browser via Tauri's opener (never an in-app fetch), so the offline
 *  guarantee and the webview CSP are untouched. */

export const YUPCHA_URL = "https://yupcha.com";
export const REPO_URL = "https://github.com/Yupcha/hr-tools";

const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** Open a URL in the default browser (desktop) or a new tab (web preview). */
export async function openExternal(url: string): Promise<void> {
  if (isTauri()) {
    try {
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      await openUrl(url);
      return;
    } catch {
      /* fall through to web behaviour */
    }
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
