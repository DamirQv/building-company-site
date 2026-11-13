import { unzipSync } from "fflate";

export type PricingEntry = {
  material: string;
  pricePerM2: number;
  astanaPricePerM2: number;
  currency?: string;
};

export type PricingSource = "google-sheets" | "default";

export type PricingData = {
  pricing: PricingEntry[];
  source: PricingSource;
  error?: PricingFailureCode;
};

/**
 * Актуальные цены (fallback) при недоступности внешней таблицы.
 * Используются, когда внешний источник временно недоступен.
 */
export const DEFAULT_PRICING: PricingEntry[] = [
  { material: "FinnBlock", pricePerM2: 160000, astanaPricePerM2: 200000, currency: "KZT" },
  { material: "Газоблок", pricePerM2: 150000, astanaPricePerM2: 190000, currency: "KZT" },
  { material: "Кирпич", pricePerM2: 155000, astanaPricePerM2: 195000, currency: "KZT" },
];

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-zа-я0-9]+/g, "");
}

/**
 * Канонический ключ материала, чтобы «Финблок»/«FinnBlock»/«Пенобетон»
 * совпадали в квизе и во внешней таблице.
 */
const MATERIAL_ALIASES: Record<string, string> = {
  finblock: "finnblock",
  пенобетон: "finnblock",
  финблок: "finnblock",
  фінблок: "finnblock",
  фиблоблок: "finnblock",
  газобетон: "газоблок",
};

function canonicalMaterialKey(material: string): string {
  const key = normalizeText(material);
  if (key.includes("finnblock") || key.includes("финблок") || key === "пенобетон") {
    return "finnblock";
  }
  return MATERIAL_ALIASES[key] ?? key;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

function normalizeGoogleSheetsUrl(raw: string): string {
  if (!raw.trim()) return "";
  const url = new URL(raw.trim());
  if (url.hostname === "docs.google.com" && url.pathname.startsWith("/spreadsheets/")) {
    const gid = url.searchParams.get("gid") ?? new URLSearchParams(url.hash.slice(1)).get("gid");
    if (/^\/spreadsheets\/d\/e\//.test(url.pathname)) {
      url.searchParams.set("output", "csv");
    } else {
      const id = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/)?.[1];
      if (!id) throw new PricingError("invalid_format");
      url.pathname = `/spreadsheets/d/${id}/export`;
      url.search = "?format=csv";
    }
    if (gid) url.searchParams.set("gid", gid);
    url.hash = "";
  }
  return url.toString();
}

/** OneDrive/Excel Online публичная ссылка → прямая загрузка XLSX. */
function toExcelDownloadUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Короткие OneDrive-ссылки (1drv.ms) — добавить download=1.
  if (/1drv\.ms|\.xlsx/i.test(trimmed)) {
    const sep = trimmed.includes("?") ? "&" : "?";
    return `${trimmed}${sep}download=1`;
  }

  return trimmed;
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export type PricingFailureCode = "not_configured" | "timeout" | "network" | "http" | "invalid_format" | "incomplete" | "duplicate" | "invalid_rate";

class PricingError extends Error {
  constructor(readonly code: PricingFailureCode, readonly status?: number) {
    super(code);
  }
}

async function fetchBinary(url: string): Promise<Uint8Array> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
    headers: {
      "User-Agent": BROWSER_UA,
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new PricingError("http", res.status);
  const buffer = await res.arrayBuffer();
  return new Uint8Array(buffer);
}

function decodeUtf8(data: Uint8Array): string {
  return new TextDecoder("utf-8").decode(data);
}

function isPkgZip(data: Uint8Array): boolean {
  return (
    data.length > 4 &&
    data[0] === 0x50 &&
    data[1] === 0x4b &&
    data[2] === 0x03 &&
    data[3] === 0x04
  );
}

/**
 * Парсинг XLSX (ZIP со sheet1.xml + sharedStrings.xml) через fflate.
 */
function parsePricingXlsx(data: Uint8Array): ParsedPricingData {
  const files = unzipSync(data);

  const sheetName = Object.keys(files).find((name) =>
    /xl\/worksheets\/sheet1\.xml$/i.test(name),
  );
  const stringsName = Object.keys(files).find((name) =>
    /xl\/sharedStrings\.xml$/i.test(name),
  );

  if (!sheetName) throw new PricingError("invalid_format");

  const textNodes = (xml: string) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)]
    .map((m) => decodeEntities(m[1])).join("");
  const sharedStrings = stringsName
    ? [...decodeUtf8(files[stringsName]).matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)].map((m) => textNodes(m[1]))
    : [];

  const sheetXml = decodeUtf8(files[sheetName]);

  // Координата клетки: столбец (1+ буква) и строка (число)
  const cellRe = /<c r="([A-Z]+)(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  const rows = new Map<number, Map<string, string | number>>();
  let match: RegExpExecArray | null;
  while ((match = cellRe.exec(sheetXml)) !== null) {
    const col = match[1];
    const rowNum = Number(match[2]);
    const attrs = match[3] ?? "";
    const inner = match[4] ?? "";

    const typeMatch = /t="([^"]+)"/.exec(attrs);
    const type = typeMatch ? typeMatch[1] : "";
    const vMatch = /<v>([^<]*)<\/v>/.exec(inner);
    const raw = type === "inlineStr" ? textNodes(inner) : vMatch ? vMatch[1] : "";

    if (!rowNum || !raw) continue;

    let value: string | number = raw;
    if (type === "s") {
      value = sharedStrings[Number(raw)] ?? "";
    } else {
      const num = Number(raw);
      value = Number.isFinite(num) ? num : raw;
    }

    if (!rows.has(rowNum)) rows.set(rowNum, new Map());
    rows.get(rowNum)!.set(col, value);
  }

  const sortedRows = Array.from(rows.keys()).sort((a, b) => a - b);
  const headerRow = rows.get(1);
  if (!headerRow) throw new PricingError("invalid_format");
  const columns = [...headerRow.keys()];
  return parsePricingRows(columns.map((col) => String(headerRow.get(col) ?? "")),
    sortedRows.filter((row) => row > 1).map((row) => columns.map((col) => String(rows.get(row)?.get(col) ?? ""))));
}

function parseNumber(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, "").replace(/(?:KZT|₸)$/i, "").replace(",", ".");
  if (!/^\+?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value > 0 && Number.isSafeInteger(Math.round(value * 1000)) ? value : null;
}

type PricingHeaderIndexes = {
  material: number;
  almaty: number;
  astana: number;
};

type ParsedPricingData = {
  entries: PricingEntry[];
};

function getPricingHeaderIndexes(headers: string[]): PricingHeaderIndexes | null {
  const normalized = headers.map(normalizeText);
  const uniqueIndex = (matches: (header: string) => boolean) => {
    const indexes = normalized.flatMap((header, index) => matches(header) ? [index] : []);
    if (indexes.length > 1) throw new PricingError("duplicate");
    return indexes[0] ?? -1;
  };
  const material = uniqueIndex((header) =>
    ["material", "maaterial", "name", "title", "type", "variant", "материал", "название", "вид"].includes(header) ||
    header.includes("material") ||
    header.includes("материал")
  );
  const almaty = uniqueIndex((header) =>
    ["алматы", "almaty", "ценазаm2", "ценазам2", "ценазам", "almatypriceperm2", "priceperm2almaty", "priceperm2", "pricepermeter", "price", "costperm2", "cost", "value", "цена", "ценазаm2", "ценазаm²", "стоимость"].includes(header)
  );
  const astana = uniqueIndex((header) =>
    ["астана", "astana", "astanapriceperm2", "priceperm2astana"].includes(header)
  );

  if (new Set(normalized).size !== normalized.length) throw new PricingError("duplicate");
  return material === -1 || almaty === -1 || astana === -1
    ? null
    : { material, almaty, astana };
}

function parsePricingRows(headers: string[], rows: string[][]): ParsedPricingData {
  const indexes = getPricingHeaderIndexes(headers);
  if (!indexes) throw new PricingError("incomplete");
  const found = new Map<string, PricingEntry>();
  for (const row of rows) {
    if (row.every((cell) => !cell.trim())) continue;
    if (row.length !== headers.length) throw new PricingError("invalid_format");
    const material = row[indexes.material]?.trim() ?? "";
    const key = canonicalMaterialKey(material);
    const expected = DEFAULT_PRICING.find((entry) => canonicalMaterialKey(entry.material) === key);
    if (!expected) throw new PricingError("invalid_rate");
    if (found.has(key)) throw new PricingError("duplicate");
    const almaty = parseNumber(row[indexes.almaty] ?? "");
    const astana = parseNumber(row[indexes.astana] ?? "");
    if (!(row[indexes.almaty]?.trim()) || !(row[indexes.astana]?.trim())) throw new PricingError("incomplete");
    if (almaty === null || astana === null) throw new PricingError("invalid_rate");
    found.set(key, { material: expected.material, pricePerM2: almaty, astanaPricePerM2: astana, currency: "KZT" });
  }
  if (found.size !== DEFAULT_PRICING.length) throw new PricingError("incomplete");
  return { entries: DEFAULT_PRICING.map((entry) => found.get(canonicalMaterialKey(entry.material))!) };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let closedQuote = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (inQuotes) {
        inQuotes = false;
        closedQuote = true;
      } else {
        if (current.trim() || closedQuote) throw new PricingError("invalid_format");
        inQuotes = true;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      closedQuote = false;
    } else {
      if (closedQuote && char.trim()) throw new PricingError("invalid_format");
      current += char;
    }
  }

  if (inQuotes) throw new PricingError("invalid_format");
  result.push(current.trim());
  return result;
}

function parsePricingCsv(csv: string): ParsedPricingData {
  const sanitized = csv.replace(/^\uFEFF/, "").trim();
  if (!sanitized) throw new PricingError("incomplete");
  if (sanitized.startsWith("<") || !sanitized.includes(",")) throw new PricingError("invalid_format");
  const rows = sanitized.split(/\r?\n/).map((row) => row.trim()).filter(Boolean).map(parseCsvLine);
  return parsePricingRows(rows[0], rows.slice(1));
}

export async function getPricingDataWithSource(): Promise<PricingData> {
  try {
    const configured = process.env.GOOGLE_SHEETS_CSV_URL?.trim() || process.env.PRICING_SHEET_URL?.trim();
    if (!configured) throw new PricingError("not_configured");
    let sourceUrl: string;
    try { sourceUrl = toExcelDownloadUrl(normalizeGoogleSheetsUrl(configured)); }
    catch { throw new PricingError("invalid_format"); }
    const raw = await fetchBinary(sourceUrl);
    let parsed: ParsedPricingData;
    if (isPkgZip(raw)) {
      try { parsed = parsePricingXlsx(raw); }
      catch (error) {
        if (error instanceof PricingError) throw error;
        throw new PricingError("invalid_format");
      }
    } else {
      parsed = parsePricingCsv(decodeUtf8(raw));
    }
    return { pricing: parsed.entries, source: "google-sheets" };
  } catch (error) {
    const details = (error ?? {}) as { name?: string; code?: string; cause?: { code?: string } };
    const code: PricingFailureCode = error instanceof PricingError ? error.code
      : details.name === "TimeoutError" || details.name === "AbortError" ||
        ["ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_HEADERS_TIMEOUT", "UND_ERR_BODY_TIMEOUT"].includes(details.cause?.code ?? details.code ?? "")
        ? "timeout" : "network";
    console.warn("[pricing] External pricing rejected; reserve rates are display-only", {
      code, ...(error instanceof PricingError && error.status ? { status: error.status } : {}),
    });
    return { pricing: DEFAULT_PRICING, source: "default", error: code };
  }
}

/** Keep the source/status intact at every consumer. */
export async function getPricingData(): Promise<PricingData> {
  return getPricingDataWithSource();
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₸/м²`;
}

export function resolveMaterialPrice(
  material: string | undefined,
  pricing: PricingEntry[],
  city: "Алматы" | "Астана" = "Алматы",
): number {
  const lookup = canonicalMaterialKey(material ?? "");
  const match = lookup ? pricing.find((entry) => canonicalMaterialKey(entry.material) === lookup) : pricing[0];
  return match ? city === "Астана" ? match.astanaPricePerM2 : match.pricePerM2 : Number.NaN;
}

export function formatCityPrice(value: number, city: "Алматы" | "Астана"): string {
  const prefix = city === "Астана" ? "от " : "";
  return `${prefix}${value.toLocaleString("ru-RU")} ₸/м²`;
}
