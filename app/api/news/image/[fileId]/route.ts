import { NextResponse } from "next/server";
import { getPublishedNews } from "@/lib/news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BITRIX_TIMEOUT_MS = 10_000;
const BITRIX_IMAGE_TIMEOUT_MS = 60_000;
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;
const CRM_FILE_FIELD = "ufCrm_1783001733";

type JsonRecord = Record<string, unknown>;

class BitrixImageError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function detectImageContentType(body: Buffer): string | null {
  if (body.length >= 3 && body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff) return "image/jpeg";
  if (body.length >= 8 && body.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (body.length >= 6 && (body.subarray(0, 6).toString("ascii") === "GIF87a" || body.subarray(0, 6).toString("ascii") === "GIF89a")) return "image/gif";
  if (body.length >= 12 && body.subarray(0, 4).toString("ascii") === "RIFF" && body.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

async function fetchWithTimeout<T>(
  url: string,
  init: RequestInit,
  consumeResponse: (response: Response) => Promise<T>,
  timeoutMs = BITRIX_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return await consumeResponse(response);
  } catch (error) {
    if (error instanceof BitrixImageError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new BitrixImageError("Image request timed out", 504);
    }
    throw new BitrixImageError("Image request failed", 502);
  } finally {
    clearTimeout(timeout);
  }
}

function resolveTrustedDownloadUrl(value: unknown, origin: string): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value, origin);
    return url.protocol === "https:" && url.origin === origin ? url.toString() : null;
  } catch {
    return null;
  }
}

function resolveTrustedMachineDownloadUrl(value: unknown, origin: string): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.origin !== origin ||
      url.username ||
      url.password ||
      url.hash ||
      !/^\/rest\/\d+\/[A-Za-z0-9_-]+\/crm\.controller\.item\.getFile\/?$/.test(url.pathname) ||
      url.searchParams.size !== 1 ||
      !url.searchParams.get("token")
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function resolveCrmFieldDownloadUrl(dealId: string, fileId: string): Promise<string> {
  const published = await getPublishedNews();
  const article = published.find((item) => item.id === dealId);
  const expectedImagePath = `/api/news/image/${fileId}-${dealId}`;
  if (!article?.images.includes(expectedImagePath)) {
    throw new BitrixImageError("Published image not found", 404);
  }

  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    throw new BitrixImageError("Bitrix24 webhook is not configured", 503);
  }

  let webhookOrigin: string;
  try {
    const url = new URL(webhookUrl);
    if (url.protocol !== "https:") throw new Error("Webhook must use HTTPS");
    webhookOrigin = url.origin;
  } catch {
    throw new BitrixImageError("Bitrix24 webhook configuration is invalid", 503);
  }

  const payload = await fetchWithTimeout(
    `${webhookUrl.replace(/\/+$/, "")}/crm.item.get.json`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ entityTypeId: 2, id: Number(dealId) }),
      cache: "no-store",
    },
    async (response) => {
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new BitrixImageError("Bitrix24 file metadata response is invalid", 502);
      }
      if (!response.ok || !isRecord(data) || data.error) {
        throw new BitrixImageError("Bitrix24 file metadata request failed", 502);
      }
      return data;
    },
  );

  const result = isRecord(payload.result) ? payload.result : null;
  const item = result && isRecord(result.item) ? result.item : null;
  const fieldValue = item?.[CRM_FILE_FIELD];
  const files = Array.isArray(fieldValue) ? fieldValue : fieldValue == null ? [] : [fieldValue];
  const file = files.find((entry) => isRecord(entry) && String(entry.id ?? "") === fileId);
  const downloadUrl = resolveTrustedMachineDownloadUrl(
    isRecord(file) ? file.urlMachine : undefined,
    webhookOrigin,
  );
  if (!downloadUrl) {
    throw new BitrixImageError("Bitrix24 machine download URL is unavailable", 502);
  }

  return downloadUrl;
}

async function readImageBody(response: Response): Promise<Buffer> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_SIZE_BYTES) {
    throw new BitrixImageError("Image is too large", 413);
  }

  if (!response.body) {
    throw new BitrixImageError("Image response has no body", 502);
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalSize += value.byteLength;
    if (totalSize > MAX_IMAGE_SIZE_BYTES) {
      await reader.cancel();
      throw new BitrixImageError("Image is too large", 413);
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

async function resolveBitrixFileDownloadUrl(fileId: string): Promise<string> {
  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    throw new BitrixImageError("Bitrix24 webhook is not configured", 503);
  }

  let webhookOrigin: string;
  try {
    const url = new URL(webhookUrl);
    if (url.protocol !== "https:") throw new Error("Webhook must use HTTPS");
    webhookOrigin = url.origin;
  } catch {
    throw new BitrixImageError("Bitrix24 webhook configuration is invalid", 503);
  }

  const endpoint = `${webhookUrl.replace(/\/+$/, "")}/disk.file.get.json`;
  const payload = await fetchWithTimeout(
    endpoint,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: Number(fileId) }),
      cache: "no-store",
    },
    async (response) => {
      let payload: Record<string, unknown> | null;
      try {
        payload = await response.json() as Record<string, unknown>;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw error;
        }
        payload = null;
      }
      if (!response.ok || !payload || payload.error) {
        throw new BitrixImageError(
          "Bitrix24 file metadata request failed",
          response.status === 404 ? 404 : 502,
        );
      }
      return payload;
    },
  );

  const result = payload.result as Record<string, unknown> | undefined;
  const downloadUrl = resolveTrustedDownloadUrl(
    result?.DOWNLOAD_URL ?? result?.downloadUrl ?? result?.download_url,
    webhookOrigin,
  );
  if (!downloadUrl) {
    throw new BitrixImageError("Bitrix24 file download URL is unavailable", 502);
  }

  return downloadUrl;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId: imageIdentifier } = await params;
  const crmFileReference = /^(\d+)-(\d+)$/.exec(imageIdentifier);
  const fileId = crmFileReference?.[1] ?? imageIdentifier;
  const dealId = crmFileReference?.[2] ?? null;

  if (!fileId || !/^\d+$/.test(fileId) || !Number.isSafeInteger(Number(fileId))) {
    return NextResponse.json({ ok: false, error: "Invalid file id" }, { status: 400 });
  }

  try {
    if (dealId !== null && !Number.isSafeInteger(Number(dealId))) {
      return NextResponse.json({ ok: false, error: "Invalid deal id" }, { status: 400 });
    }

    const downloadUrl = dealId
      ? await resolveCrmFieldDownloadUrl(dealId, fileId)
      : await resolveBitrixFileDownloadUrl(fileId);
    const body = await fetchWithTimeout(
      downloadUrl,
      {
        cache: "no-store",
        headers: { Accept: "image/*" },
        redirect: "manual",
      },
      async (imageResponse) => {
        if (!imageResponse.ok) {
          throw new BitrixImageError(
            "Bitrix24 image request failed",
            imageResponse.status === 404 ? 404 : 502,
          );
        }
        return readImageBody(imageResponse);
      },
      BITRIX_IMAGE_TIMEOUT_MS,
    );
    const contentType = detectImageContentType(body);

    if (!contentType) {
      throw new BitrixImageError("Bitrix24 did not return an image file", 502);
    }

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const status = error instanceof BitrixImageError ? error.status : 502;
    const message = status === 404 ? "Image not found" : status === 413 ? "Image is too large" : "Image is temporarily unavailable";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
