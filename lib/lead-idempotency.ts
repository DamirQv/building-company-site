import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename, stat } from "node:fs/promises";
import path from "node:path";

type Receipt = { fingerprint: string; status: number; body: Record<string, unknown> };
const pending = { status: 409, body: { ok: false, code: "submission_pending", error: "Отправка уже началась. Не создавайте повторную заявку: дождитесь ответа или свяжитесь с менеджером." } };
const conflict = { status: 409, body: { ok: false, code: "submission_conflict", error: "Этот запрос уже использован для другой заявки." } };

export function leadFingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function directory(key: string): string {
  // Outside .next: survives builds/restarts and is shared by PM2 workers on this host.
  return path.join(process.cwd(), ".data", "lead-requests", leadFingerprint(key));
}

export async function savedLead(key: string, fingerprint: string) {
  try {
    const receipt: Receipt = JSON.parse(await readFile(path.join(directory(key), "result.json"), "utf8"));
    return receipt.fingerprint === fingerprint ? receipt : conflict;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  try {
    const claim = JSON.parse(await readFile(path.join(directory(key), "claim.json"), "utf8"));
    return claim.fingerprint === fingerprint ? pending : conflict;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    // A worker may have atomically created the directory but not written claim.json yet.
    try { await stat(directory(key)); return pending; }
    catch (retryError) {
      if ((retryError as NodeJS.ErrnoException).code !== "ENOENT") throw retryError;
    }
    return null;
  }
}

export async function claimLead(key: string, fingerprint: string): Promise<boolean> {
  const dir = directory(key);
  await mkdir(path.dirname(dir), { recursive: true, mode: 0o700 });
  try { await mkdir(dir, { mode: 0o700 }); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") return false;
    throw error;
  }
  await writeFile(path.join(dir, "claim.json"), JSON.stringify({ fingerprint }), { mode: 0o600 });
  return true;
}

export async function completeLead(key: string, fingerprint: string, status: number, body: Record<string, unknown>) {
  const dir = directory(key);
  await writeFile(path.join(dir, "result.tmp"), JSON.stringify({ fingerprint, status, body }), { mode: 0o600 });
  await rename(path.join(dir, "result.tmp"), path.join(dir, "result.json"));
}
