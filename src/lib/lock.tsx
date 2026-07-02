import {
  createContext, useCallback, useContext, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import type { Profile } from "./profiles";

/**
 * App Lock — optional passphrase encryption at rest for Saved Profiles, the
 * one store holding real PII (names, salaries, contacts). Everything runs on
 * WebCrypto; there are no dependencies and, as everywhere in hr-tools, no
 * network. With the lock enabled, `hrt.profiles` on disk is an AES-GCM blob
 * whose key is derived from the passphrase (PBKDF2) and held only in memory
 * for the session — without the passphrase the roster is unreadable, even by
 * another process that can open the WebView's localStorage file.
 *
 * Deliberately NOT covered: favorites/recents/theme (tool metadata, no PII).
 * The passphrase is unrecoverable by design — the lock screen offers an
 * explicit typed-confirmation erase as the only way out.
 */

const LOCK_KEY = "hrt.lock";
const PROFILES_KEY = "hrt.profiles";
const CHECK_PLAINTEXT = "hrt-lock-check:v2";
const PBKDF2_ITERATIONS = 310_000;

const enc = new TextEncoder();
const dec = new TextDecoder();

/* base64 helpers — chunked so multi-MB payloads (logo data URLs) don't blow the stack */
function b64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export interface EncBlob {
  iv: string;
  data: string;
}

export interface LockRecord {
  salt: string;
  check: EncBlob;
}

export async function deriveKey(pass: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptString(key: CryptoKey, plain: string): Promise<EncBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain));
  return { iv: b64(iv), data: b64(new Uint8Array(data)) };
}

export async function decryptString(key: CryptoKey, blob: EncBlob): Promise<string> {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unb64(blob.iv) as BufferSource },
    key,
    unb64(blob.data) as BufferSource,
  );
  return dec.decode(plain);
}

/** Create a fresh lock record (salt + passphrase-check blob) and its key. */
export async function makeLockRecord(pass: string): Promise<{ record: LockRecord; key: CryptoKey }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(pass, salt);
  const check = await encryptString(key, CHECK_PLAINTEXT);
  return { record: { salt: b64(salt), check }, key };
}

/** Derive the key for an existing record; null if the passphrase is wrong. */
export async function openLockRecord(pass: string, record: LockRecord): Promise<CryptoKey | null> {
  const key = await deriveKey(pass, unb64(record.salt));
  try {
    if ((await decryptString(key, record.check)) !== CHECK_PLAINTEXT) return null;
    return key;
  } catch {
    return null; // AES-GCM auth failure — wrong passphrase
  }
}

/** Shape of `hrt.profiles` on disk when the lock is on. */
export interface EncProfiles extends EncBlob {
  __enc: 1;
}
export const isEncryptedRecord = (v: unknown): v is EncProfiles =>
  typeof v === "object" && v !== null && (v as EncProfiles).__enc === 1;

/* ── Vault context — single owner of the profiles store ─────────────────── */

interface Vault {
  /** Lock configured (an `hrt.lock` record exists). */
  enabled: boolean;
  /** Enabled and not yet unlocked this session — the app should be gated. */
  locked: boolean;
  profiles: Profile[];
  setProfiles: (updater: (prev: Profile[]) => Profile[]) => void;
  unlock: (pass: string) => Promise<boolean>;
  enable: (pass: string) => Promise<void>;
  disable: () => void;
  changePass: (oldPass: string, newPass: string) => Promise<boolean>;
  /** Lock-screen escape hatch: wipe profiles + lock record. */
  eraseAndReset: () => void;
}

const VaultContext = createContext<Vault | null>(null);

const readLockRecord = (): LockRecord | null => {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    return raw ? (JSON.parse(raw) as LockRecord) : null;
  } catch {
    return null;
  }
};

const readRawProfiles = (): unknown => {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function LockProvider({ children }: { children: ReactNode }) {
  const [record, setRecord] = useState<LockRecord | null>(readLockRecord);
  const keyRef = useRef<CryptoKey | null>(null);
  const [locked, setLocked] = useState<boolean>(() => readLockRecord() !== null);
  const [profiles, setProfilesState] = useState<Profile[]>(() => {
    const raw = readRawProfiles();
    return Array.isArray(raw) ? (raw as Profile[]) : []; // encrypted → hydrate on unlock
  });

  const persist = useCallback((list: Profile[]) => {
    const key = keyRef.current;
    if (key) {
      void encryptString(key, JSON.stringify(list)).then((blob) => {
        try {
          localStorage.setItem(PROFILES_KEY, JSON.stringify({ __enc: 1, ...blob }));
        } catch {
          /* quota — ignore, memory copy stays live */
        }
      });
    } else {
      try {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
      } catch {
        /* quota — ignore */
      }
    }
  }, []);

  const setProfiles = useCallback(
    (updater: (prev: Profile[]) => Profile[]) => {
      setProfilesState((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const unlock = useCallback(
    async (pass: string) => {
      if (!record) return true;
      const key = await openLockRecord(pass, record);
      if (!key) return false;
      keyRef.current = key;
      const raw = readRawProfiles();
      if (isEncryptedRecord(raw)) {
        try {
          const list = JSON.parse(await decryptString(key, raw)) as Profile[];
          setProfilesState(Array.isArray(list) ? list : []);
        } catch {
          setProfilesState([]);
        }
      } else if (Array.isArray(raw)) {
        // enabled but store still plaintext (interrupted enable) — heal it
        setProfilesState(raw as Profile[]);
        void encryptString(key, JSON.stringify(raw)).then((blob) =>
          localStorage.setItem(PROFILES_KEY, JSON.stringify({ __enc: 1, ...blob })),
        );
      }
      setLocked(false);
      return true;
    },
    [record],
  );

  const enable = useCallback(
    async (pass: string) => {
      const { record: rec, key } = await makeLockRecord(pass);
      keyRef.current = key;
      localStorage.setItem(LOCK_KEY, JSON.stringify(rec));
      setRecord(rec);
      setLocked(false);
      setProfilesState((list) => {
        persist(list);
        return list;
      });
    },
    [persist],
  );

  const disable = useCallback(() => {
    keyRef.current = null;
    localStorage.removeItem(LOCK_KEY);
    setRecord(null);
    setLocked(false);
    setProfilesState((list) => {
      try {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
      } catch {
        /* quota — ignore */
      }
      return list;
    });
  }, []);

  const changePass = useCallback(
    async (oldPass: string, newPass: string) => {
      if (!record) return false;
      if (!(await openLockRecord(oldPass, record))) return false;
      await enable(newPass);
      return true;
    },
    [record, enable],
  );

  const eraseAndReset = useCallback(() => {
    localStorage.removeItem(PROFILES_KEY);
    localStorage.removeItem(LOCK_KEY);
    keyRef.current = null;
    setRecord(null);
    setProfilesState([]);
    setLocked(false);
  }, []);

  // Re-lock when the OS/user backgrounds the app for a while? Deliberately not:
  // desktop session semantics — locked once per app launch, like a password DB.

  const value = useMemo<Vault>(
    () => ({
      enabled: record !== null,
      locked,
      profiles,
      setProfiles,
      unlock,
      enable,
      disable,
      changePass,
      eraseAndReset,
    }),
    [record, locked, profiles, setProfiles, unlock, enable, disable, changePass, eraseAndReset],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault(): Vault {
  const v = useContext(VaultContext);
  if (!v) throw new Error("useVault must be used inside <LockProvider>");
  return v;
}
