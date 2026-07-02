import { describe, expect, it } from "vitest";
import {
  decryptString, deriveKey, encryptString, isEncryptedRecord, makeLockRecord, openLockRecord,
} from "./lock";

const salt = new Uint8Array(16).fill(7);

describe("App Lock crypto", () => {
  it("round-trips a string", async () => {
    const key = await deriveKey("correct horse battery staple", salt);
    const blob = await encryptString(key, "hello ₹18,00,000 — Priya");
    expect(await decryptString(key, blob)).toBe("hello ₹18,00,000 — Priya");
  });

  it("produces a fresh IV per encryption", async () => {
    const key = await deriveKey("pass-phrase-1", salt);
    const a = await encryptString(key, "same plaintext");
    const b = await encryptString(key, "same plaintext");
    expect(a.iv).not.toBe(b.iv);
    expect(a.data).not.toBe(b.data);
  });

  it("rejects decryption with the wrong key", async () => {
    const right = await deriveKey("right password", salt);
    const wrong = await deriveKey("wrong password", salt);
    const blob = await encryptString(right, "secret roster");
    await expect(decryptString(wrong, blob)).rejects.toThrow();
  });

  it("handles multi-megabyte payloads (chunked base64)", async () => {
    const key = await deriveKey("pass-phrase-1", salt);
    const big = "x".repeat(2_500_000); // ~ a large base64 logo
    const blob = await encryptString(key, big);
    expect(await decryptString(key, blob)).toBe(big);
  });

  it("makeLockRecord/openLockRecord verify the passphrase", async () => {
    const { record } = await makeLockRecord("my vault passphrase");
    expect(await openLockRecord("my vault passphrase", record)).not.toBeNull();
    expect(await openLockRecord("not the passphrase", record)).toBeNull();
    expect(await openLockRecord("", record)).toBeNull();
  });

  it("unlocked key from openLockRecord decrypts data encrypted at enable-time", async () => {
    const { record, key } = await makeLockRecord("season pass 9");
    const stored = await encryptString(key, JSON.stringify([{ id: "1", label: "Priya" }]));
    const reopened = await openLockRecord("season pass 9", record);
    expect(reopened).not.toBeNull();
    expect(JSON.parse(await decryptString(reopened!, stored))).toEqual([
      { id: "1", label: "Priya" },
    ]);
  });

  it("isEncryptedRecord discriminates the on-disk shapes", () => {
    expect(isEncryptedRecord({ __enc: 1, iv: "a", data: "b" })).toBe(true);
    expect(isEncryptedRecord([])).toBe(false);
    expect(isEncryptedRecord([{ id: "1" }])).toBe(false);
    expect(isEncryptedRecord(null)).toBe(false);
    expect(isEncryptedRecord("string")).toBe(false);
  });
});
