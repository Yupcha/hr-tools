// Set the app version across the manifests. Used by CI to stamp each build
// (e.g. `node scripts/set-version.mjs 0.1.7`). Cross-platform (no sed).
import { readFileSync, writeFileSync } from "node:fs";

const v = process.argv[2];
if (!v || !/^\d+\.\d+\.\d+$/.test(v)) {
  console.error("usage: node scripts/set-version.mjs <major.minor.patch>");
  process.exit(1);
}

const setJson = (file, version) => {
  const obj = JSON.parse(readFileSync(file, "utf8"));
  obj.version = version;
  writeFileSync(file, JSON.stringify(obj, null, 2) + "\n");
};

setJson("package.json", v);
setJson("src-tauri/tauri.conf.json", v);

// Cargo.toml — the package version is the only line that starts with `version = `.
let cargo = readFileSync("src-tauri/Cargo.toml", "utf8");
cargo = cargo.replace(/^version = ".*"$/m, `version = "${v}"`);
writeFileSync("src-tauri/Cargo.toml", cargo);

console.log("version set to", v);
