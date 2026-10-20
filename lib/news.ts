import { articles, type BlogArticle } from "@/lib/articles";

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  category: string;
  images: string[];
};

type BitrixDeal = {
  ID?: string | number;
  TITLE?: string;
  COMMENTS?: string;
  BEGINDATE?: string;
  DATE_CREATE?: string;
  MOVED_TIME?: string;
  STAGE_ID?: string;
  CATEGORY_ID?: string | number;
  UF_CRM_1783001733?: unknown;
};

const PUBLICATIONS_CATEGORY_ID = 9;
const PUBLICATION_STAGE_NAME = "опубликовать";
const PUBLICATION_FILE_FIELD = "UF_CRM_1783001733";
const EXCLUDED_TEST_DEAL_IDS = new Set(["939"]);
// CATEGORY_ID identifies the CRM pipeline, not a separate editorial category.
const DEFAULT_CATEGORY = "Публикации";
const BITRIX_TIMEOUT_MS = 6000;

type BitrixNewsFailureCode =
  | "webhook_not_configured"
  | "insufficient_scope"
  | "invalid_webhook"
  | "invalid_request"
  | "timeout"
  | "network_error"
  | "invalid_response"
  | "upstream_error";

export class BitrixNewsError extends Error {
  constructor(
    readonly method: string,
    readonly status: number,
    readonly code: BitrixNewsFailureCode,
  ) {
    super(`Bitrix24 news request failed: ${method} (${code})`);
    this.name = "BitrixNewsError";
  }
}

function classifyBitrixFailure(
  errorCode: string,
  status: number,
): BitrixNewsFailureCode {
  const normalized = errorCode.toLowerCase();
  if (normalized === "insufficient_scope") return "insufficient_scope";
  if (
    status === 401 ||
    normalized.includes("invalid_token") ||
    normalized.includes("invalid_credentials") ||
    normalized.includes("expired_token") ||
    normalized.includes("no_auth_found")
  ) {
    return "invalid_webhook";
  }
  if (
    normalized.includes("argument") ||
    normalized.includes("parameter") ||
    normalized.includes("method_not_found")
  ) {
    return "invalid_request";
  }
  return "upstream_error";
}

function normalizeTitle(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function transliterateToLatin(value: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "c", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    А: "A", Б: "B", В: "V", Г: "G", Д: "D", Е: "E", Ё: "E", Ж: "Zh", З: "Z", И: "I", Й: "Y",
    К: "K", Л: "L", М: "M", Н: "N", О: "O", П: "P", Р: "R", С: "S", Т: "T", У: "U", Ф: "F",
    Х: "H", Ц: "C", Ч: "Ch", Ш: "Sh", Щ: "Shch", Ъ: "", Ы: "Y", Ь: "", Э: "E", Ю: "Yu", Я: "Ya",
  };

  return value
    .split("")
    .map((char) => map[char] ?? char)
    .join("")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function normalizeSlug(value: string): string {
  return transliterateToLatin(value || "");
}

export function buildBitrixNewsSlug(title: string, id: string | number): string {
  const safeTitle = normalizeTitle(title || `news-${id}`);
  const base = normalizeSlug(safeTitle);
  const numericId = String(id).trim();
  return base ? `${base}-${numericId}` : `news-${numericId}`;
}

export function resolveBitrixNewsSlug(slug: string): string {
  const normalized = (slug || "").trim();
  try {
    return decodeURIComponent(normalized).replace(/\/+$/, "").replace(/^\/+/, "");
  } catch {
    return normalized.replace(/\/+$/, "").replace(/^\/+/, "");
  }
}

export function findBitrixNewsBySlug(newsList: NewsArticle[], slug: string): NewsArticle | undefined {
  const normalized = resolveBitrixNewsSlug(slug);
  if (!normalized) return undefined;

  const byExact = newsList.find((item) => item.slug === normalized);
  if (byExact) return byExact;

  const byId = newsList.find((item) => item.id === normalized.split("-").pop() || item.slug.endsWith(`-${normalized.split("-").pop() ?? ""}`));
  if (byId) return byId;

  return newsList.find((item) => item.slug === buildBitrixNewsSlug(item.title, item.id));
}

function stripSimpleBbCode(value: string): string {
  if (!value) return "";

  return value
    .replace(/\[(\/?)\s*(p|br|b|i|u|strong|em|code|quote|list|ul|ol|li|url|img)\b[^\]]*\]/gi, "")
    .replace(/\[\*\]/gi, "\n- ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function plainTextFromHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getExcerptText(value: string): string {
  const clean = stripSimpleBbCode(value || "");
  const plain = plainTextFromHtml(clean).replace(/\s+/g, " ").trim();
  if (!plain) return "";

  if (plain.length <= 180) return plain;
  return `${plain.slice(0, 177).trim()}...`;
}

function buildNewsContent(value: string): string {
  const clear = stripSimpleBbCode(value || "");
  return plainTextFromHtml(clear);
}

function parsePublishedAt(value: string | undefined): string {
  const raw = value?.trim() ?? "";
  if (!raw) return "";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString();
}

function extractFileIds(rawValue: unknown): string[] {
  if (!rawValue) return [];

  const items = Array.isArray(rawValue) ? rawValue : [rawValue];
  const ids = new Set<string>();

  for (const item of items) {
    const possibleId =
      typeof item === "object" && item !== null
        ? (item as Record<string, unknown>).id ??
          (item as Record<string, unknown>).fileId ??
          (item as Record<string, unknown>).file_id ??
          (item as Record<string, unknown>).FILE_ID ??
          (item as Record<string, unknown>).ID ??
          (item as Record<string, unknown>).fileID
        : item;

    const numeric = typeof possibleId === "number" ? possibleId : Number(possibleId);
    if (Number.isFinite(numeric)) {
      ids.add(String(numeric));
    }
  }

  return Array.from(ids);
}

function toBitrixUrl(base: string): string {
  return `${base.replace(/\/+$/, "")}`;
}

async function bitrixFetchJson(baseUrl: string, method: string, payload: Record<string, unknown>): Promise<unknown> {
  const url = `${toBitrixUrl(baseUrl)}/${method}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BITRIX_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });

    const rawText = await response.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText) as unknown;
    } catch {
      throw new BitrixNewsError(
        method,
        response.status || 502,
        response.ok ? "invalid_response" : classifyBitrixFailure("", response.status),
      );
    }

    const record = parsed as Record<string, unknown> | null;
    const errorCode = typeof record?.error === "string" ? record.error : "";
    if (!response.ok || errorCode) {
      throw new BitrixNewsError(
        method,
        response.status || 502,
        classifyBitrixFailure(errorCode, response.status),
      );
    }

    return parsed;
  } catch (error) {
    if (error instanceof BitrixNewsError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new BitrixNewsError(method, 504, "timeout");
    }
    throw new BitrixNewsError(method, 502, "network_error");
  } finally {
    clearTimeout(timeout);
  }
}

async function getPublishedStageId(baseUrl: string): Promise<string> {
  const method = "crm.dealcategory.stage.list.json";
  const response = await bitrixFetchJson(baseUrl, method, { id: PUBLICATIONS_CATEGORY_ID });
  const record = response as Record<string, unknown>;
  const result = record.result;
  const stages = Array.isArray(result)
    ? result
    : Array.isArray((result as Record<string, unknown> | null)?.items)
      ? ((result as Record<string, unknown>).items as unknown[])
      : [];
  const publishedStage = stages.find((item) => {
    if (!item || typeof item !== "object") return false;
    const name = (item as Record<string, unknown>).NAME;
    return typeof name === "string" && name.trim().toLocaleLowerCase("ru") === PUBLICATION_STAGE_NAME;
  }) as Record<string, unknown> | undefined;
  const stageId = publishedStage?.STATUS_ID ?? publishedStage?.STAGE_ID ?? publishedStage?.ID;

  if (typeof stageId !== "string" || !stageId) {
    throw new BitrixNewsError(method, 502, "invalid_response");
  }

  return stageId;
}

async function getBitrixDeals(baseUrl: string, publishedStageId: string): Promise<BitrixDeal[]> {
  const response = await bitrixFetchJson(baseUrl, "crm.deal.list.json", {
    filter: {
      CATEGORY_ID: PUBLICATIONS_CATEGORY_ID,
      STAGE_ID: publishedStageId,
    },
    order: { DATE_CREATE: "DESC" },
    select: [
      "ID",
      "TITLE",
      "COMMENTS",
      "BEGINDATE",
      "DATE_CREATE",
      "MOVED_TIME",
      "STAGE_ID",
      "CATEGORY_ID",
      PUBLICATION_FILE_FIELD,
    ],
  });
  const record = response as Record<string, unknown>;
  const result = record.result;

  if (Array.isArray(result)) return result as BitrixDeal[];
  if (Array.isArray((result as Record<string, unknown> | null)?.items)) {
    return (result as { items: BitrixDeal[] }).items;
  }
  throw new BitrixNewsError("crm.deal.list.json", 502, "invalid_response");
}

export async function getPublishedNews(): Promise<NewsArticle[]> {
  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    throw new BitrixNewsError("configuration", 503, "webhook_not_configured");
  }

  const baseUrl = toBitrixUrl(webhookUrl);
  const publishedStageId = await getPublishedStageId(baseUrl);
  const publishedDeals = await getBitrixDeals(baseUrl, publishedStageId);

  return publishedDeals
    .filter((deal) => !EXCLUDED_TEST_DEAL_IDS.has(String(deal.ID ?? "")))
    .map((deal) => {
      const id = String(deal.ID ?? "");
      const title = normalizeTitle(deal.TITLE);
      if (!title) return null;

      const content = buildNewsContent(typeof deal.COMMENTS === "string" ? deal.COMMENTS : "");
      const excerpt = getExcerptText(typeof deal.COMMENTS === "string" ? deal.COMMENTS : "");
      const publishedAt =
        parsePublishedAt(typeof deal.MOVED_TIME === "string" ? deal.MOVED_TIME : undefined) ||
        parsePublishedAt(typeof deal.BEGINDATE === "string" ? deal.BEGINDATE : undefined) ||
        parsePublishedAt(typeof deal.DATE_CREATE === "string" ? deal.DATE_CREATE : undefined);
      const images = extractFileIds(deal[PUBLICATION_FILE_FIELD]).map(
        (fileId) => `/api/news/image/${fileId}-${encodeURIComponent(id)}`,
      );

      return {
        id,
        slug: buildBitrixNewsSlug(title, id),
        title,
        excerpt: excerpt || title,
        content: content || excerpt || title,
        publishedAt,
        category: DEFAULT_CATEGORY,
        images,
      } satisfies NewsArticle;
    })
    .filter((value): value is NewsArticle => value !== null)
    .sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
}

export async function getPublishedNewsForPage(): Promise<NewsArticle[]> {
  return getPublishedNews();
}

export function getStaticArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function newsToBlogArticle(news: NewsArticle, relatedSlugs: string[] = []): BlogArticle {
  const paragraphs: string[] = [];
  const bullets: string[] = [];
  for (const line of news.content.split(/\n+/).map((item) => item.trim()).filter(Boolean)) {
    if (/^[-•]\s*/.test(line)) bullets.push(line.replace(/^[-•]\s*/, ""));
    else paragraphs.push(line);
  }
  const displayParagraphs = paragraphs.length > 0 ? paragraphs : [news.content || news.excerpt || news.title];
  const fullText = displayParagraphs.join(" ").trim();
  const imageItems = news.images.map((src, index) => ({
    src,
    alt: `Фотография публикации «${news.title}», ${index + 1}`,
  }));
  const publishedDate = news.publishedAt.slice(0, 10);

  return {
    slug: news.slug,
    title: news.title,
    metaTitle: news.title,
    description: news.excerpt || fullText,
    category: news.category,
    publishedAt: publishedDate,
    status: "published",
    readingMinutes: Math.max(1, Math.ceil(fullText.split(/\s+/).length / 200)),
    cover: imageItems[0]?.src ?? null,
    coverAlt: imageItems[0]?.alt ?? "",
    images: imageItems,
    content: [
      {
        heading: news.title,
        paragraphs: displayParagraphs,
        ...(bullets.length > 0 ? { bullets } : {}),
      },
    ],
    relatedSlugs,
  } satisfies BlogArticle;
}

export function newsToBlogArticles(news: NewsArticle[]): BlogArticle[] {
  return news.map((article, index) => {
    const relatedSlugs = news
      .filter((candidate, candidateIndex) => candidateIndex !== index)
      .slice(0, 2)
      .map((candidate) => candidate.slug);
    return newsToBlogArticle(article, relatedSlugs);
  });
}

export type PublishedNewsResult =
  | { ok: true; items: NewsArticle[] }
  | { ok: false; error: BitrixNewsError };

export async function getPublishedNewsResult(): Promise<PublishedNewsResult> {
  try {
    return { ok: true, items: await getPublishedNews() };
  } catch (error) {
    if (error instanceof BitrixNewsError) return { ok: false, error };
    throw error;
  }
}
