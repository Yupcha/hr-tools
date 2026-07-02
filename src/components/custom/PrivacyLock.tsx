import { useState } from "react";
import { getIcon } from "../../lib/icons";
import { cn } from "../../lib/useLocalStorage";
import { useVault } from "../../lib/lock";

/**
 * App Lock settings — enable/disable/change the passphrase that encrypts
 * Saved Profiles at rest (see src/lib/lock.tsx for the crypto).
 */
export default function PrivacyLock() {
  const { enabled, enable, disable, changePass, profiles } = useVault();

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [oldP, setOldP] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mode, setMode] = useState<"idle" | "change" | "disable">("idle");

  const Shield = getIcon("ShieldCheck");
  const Lock = getIcon("KeyRound");
  const Check = getIcon("Check");
  const X = getIcon("X");

  const reset = () => {
    setP1("");
    setP2("");
    setOldP("");
    setMode("idle");
  };

  const doEnable = async () => {
    if (p1.length < 8) return setMsg({ ok: false, text: "Use at least 8 characters." });
    if (p1 !== p2) return setMsg({ ok: false, text: "Passphrases don't match." });
    setBusy(true);
    await enable(p1);
    setBusy(false);
    reset();
    setMsg({ ok: true, text: "App Lock is on — profiles are now encrypted on this device." });
  };

  const doChange = async () => {
    if (p1.length < 8) return setMsg({ ok: false, text: "Use at least 8 characters." });
    if (p1 !== p2) return setMsg({ ok: false, text: "New passphrases don't match." });
    setBusy(true);
    const ok = await changePass(oldP, p1);
    setBusy(false);
    if (!ok) return setMsg({ ok: false, text: "Current passphrase is wrong." });
    reset();
    setMsg({ ok: true, text: "Passphrase changed." });
  };

  const doDisable = () => {
    disable();
    reset();
    setMsg({ ok: true, text: "App Lock is off — profiles are stored unencrypted again." });
  };

  const field =
    "w-full rounded-yc border border-hairline bg-canvas px-3 py-2 text-[13px] text-ink outline-none transition focus:border-coral focus:bg-surface focus:ring-4 focus:ring-coral/10";
  const primaryBtn =
    "inline-flex items-center gap-1.5 rounded-yc bg-ink px-3.5 py-2 text-[12px] font-semibold text-canvas transition hover:opacity-90 disabled:opacity-40";
  const ghostBtn =
    "rounded-yc border border-hairline px-3.5 py-2 text-[12px] font-semibold text-muted transition hover:text-ink";

  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-yc border border-hairline bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[15px] font-bold text-ink">
          <Lock size={17} className="text-coral" /> App Lock
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              enabled ? "bg-mint/15 text-mint" : "bg-soft text-faint",
            )}
          >
            {enabled ? "On" : "Off"}
          </span>
        </div>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-muted">
          Encrypts your <strong>Saved Profiles</strong> ({profiles.length} saved) on this device
          with a passphrase — AES-256, derived on-device, never stored. With the lock on, the
          app asks for the passphrase once per launch, and the profile data on disk is
          unreadable without it.
        </p>

        {msg && (
          <p
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium",
              msg.ok ? "text-mint" : "text-coral",
            )}
          >
            {msg.ok ? <Check size={14} /> : <X size={14} />} {msg.text}
          </p>
        )}

        {!enabled ? (
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-body">Passphrase (min 8 characters)</span>
              <input type="password" className={field} value={p1} onChange={(e) => setP1(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-body">Repeat passphrase</span>
              <input type="password" className={field} value={p2} onChange={(e) => setP2(e.target.value)} />
            </label>
            <button onClick={() => void doEnable()} disabled={busy || !p1 || !p2} className={primaryBtn}>
              <Lock size={14} /> {busy ? "Encrypting…" : "Turn on App Lock"}
            </button>
          </div>
        ) : mode === "change" ? (
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-body">Current passphrase</span>
              <input type="password" className={field} value={oldP} onChange={(e) => setOldP(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-body">New passphrase (min 8 characters)</span>
              <input type="password" className={field} value={p1} onChange={(e) => setP1(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-body">Repeat new passphrase</span>
              <input type="password" className={field} value={p2} onChange={(e) => setP2(e.target.value)} />
            </label>
            <div className="flex gap-2">
              <button onClick={() => void doChange()} disabled={busy || !oldP || !p1 || !p2} className={primaryBtn}>
                {busy ? "Re-encrypting…" : "Change passphrase"}
              </button>
              <button onClick={reset} className={ghostBtn}>Cancel</button>
            </div>
          </div>
        ) : mode === "disable" ? (
          <div className="mt-4 rounded-yc border border-coral/30 bg-coral/5 p-4">
            <p className="text-[12.5px] leading-relaxed text-body">
              Turning App Lock off stores your {profiles.length} saved profile
              {profiles.length === 1 ? "" : "s"} <strong>unencrypted</strong> again, protected only
              by your OS user account.
            </p>
            <div className="mt-3 flex gap-2">
              <button onClick={doDisable} className="rounded-yc bg-coral px-3.5 py-2 text-[12px] font-semibold text-white transition hover:opacity-90">
                Turn off & decrypt
              </button>
              <button onClick={reset} className={ghostBtn}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex gap-2">
            <button onClick={() => setMode("change")} className={primaryBtn}>Change passphrase</button>
            <button onClick={() => setMode("disable")} className={ghostBtn}>Turn off</button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-yc border border-hairline bg-soft/40 px-4 py-3 text-[12px] leading-relaxed text-muted">
        <Shield size={15} className="mt-0.5 shrink-0 text-teal" />
        <span>
          The passphrase is <strong>unrecoverable by design</strong> — nothing about it is stored,
          so losing it means erasing the saved profiles to keep using the app. Everything stays
          on this machine either way; App Lock only changes how the data rests on disk.
        </span>
      </div>
    </div>
  );
}
