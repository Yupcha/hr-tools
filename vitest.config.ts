import { defineConfig } from "vitest/config";

// Standalone test config (kept separate from vite.config.ts, which carries
// Tauri dev-server settings). Tests are pure functions — node env, no DOM.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
