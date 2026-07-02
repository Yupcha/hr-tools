import { useState } from "react";
import { getIcon } from "../lib/icons";
import { cn } from "../lib/useLocalStorage";
import { useVault } from "../lib/lock";

/**
 * Full-app gate shown while the App Lock is enabled and the vault is still
 * locked. Everything else (tools, sidebar, palette) mounts only after unlock,
 * so no PII can render — or be searched — behind the curtain.
 */
export default function LockScreen() {
  const { unlock, eraseAndReset } = useVault();
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [erasing, setErasing] = useState(false);
  const [confirm, setConfirm] = useState("");

  const Shield = getIcon("ShieldCheck");
  const Lock = getIcon("KeyRound");

  const submit = async () => {
    if (!pass || busy) return;
    setBusy(true);
    setError(null);
    const ok = await unlock(pass);
    if (!ok) {
      setError("Wrong passphrase — try again.");
      setPass("");
    }
    setBusy(false);
  };

  const field =
    "w-full rounded-yc border border-hairline bg-canvas px-3 py-2.5 text-[14px] text-ink outline-none transition focus:border-coral focus:bg-surface focus:ring-4 focus:ring-coral/10";

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-canvas p-6 text-body">
      <div className="w-full max-w-sm">
        <div className="rounded-yc border border-hairline bg-surface p-6 shadow-sm">
          <div className="mb-1 flex items-center gap-2 text-[16px] font-bold text-ink">
            <Lock size={18} className="text-coral" /> hr-tools is locked
          </div>
          <p className="mb-4 text-[13px] leading-relaxed text-muted">
            Saved profiles are encrypted on this device. Enter your passphrase to open your
            workspace.
          </p>

          <input
            autoFocus
            type="password"
            className={field}
            placeholder="Passphrase"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void submit()}
            aria-label="App Lock passphrase"
          />
          {error && <p className="mt-2 text-[12px] font-medium text-coral">{error}</p>}

          <button
            onClick={() => void submit()}
            disabled={!pass || busy}
            className="mt-4 w-full rounded-yc bg-ink px-4 py-2.5 text-[13px] font-semibold text-canvas transition hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Unlocking…" : "Unlock"}
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-yc border border-hairline bg-soft/40 px-4 py-3 text-[12px] leading-relaxed text-muted">
          <Shield size={15} className="mt-0.5 shrink-0 text-teal" />
          <span>
            The passphrase never leaves this device and cannot be recovered. Calculators and
            letter templates carry no saved data — only your saved people are locked.
          </span>
        </div>

        {!erasing ? (
          <button
            onClick={() => setErasing(true)}
            className="mt-4 w-full text-center text-[12px] font-medium text-faint underline-offset-2 transition hover:text-coral hover:underline"
          >
            Forgot the passphrase?
          </button>
        ) : (
          <div className="mt-4 rounded-yc border border-coral/30 bg-coral/5 p-4">
            <p className="text-[12.5px] leading-relaxed text-body">
              Without the passphrase the saved profiles can't be decrypted. The only way to keep
              using the app is to <strong>erase the saved profiles</strong> and start fresh. Type{" "}
              <span className="font-mono font-bold">ERASE</span> to confirm:
            </p>
            <input
              className={cn(field, "mt-3 font-mono")}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="ERASE"
              aria-label="Type ERASE to confirm"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={eraseAndReset}
                disabled={confirm !== "ERASE"}
                className="flex-1 rounded-yc bg-coral px-3 py-2 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                Erase profiles & unlock
              </button>
              <button
                onClick={() => {
                  setErasing(false);
                  setConfirm("");
                }}
                className="rounded-yc border border-hairline px-3 py-2 text-[12px] font-semibold text-muted transition hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
