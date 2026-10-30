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
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (/docs\.google\.com\/spreadsheets\/d\/e\/[^/]+\/pub(?:\?|$)/i.test(trimmed)) {
    return trimmed;
  }

  if (/docs\.google\.com\/spreadsheets\//i.test(trimmed)) {
    const match = trimmed.match(/\/spreadsheets\/d\/([^/]+)/i);
    if (match) {
      const sheetId = match[1];
      const gidMatch = trimmed.match(/[?&]gid=(\d+)/i);
      const gid = gidMatch ? `&gid=${gidMatch[1]}` : "";
      return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid}`;
    }
  }

  return trimmed;
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
  if (!res.ok) throw new Error(`Pricing fetch failed: ${res.status}`);
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

  if (!sheetName) return { entries: [], usesDefaultPricing: false };

  const sharedStrings = stringsName
    ? [...decodeUtf8(files[stringsName]).matchAll(/<t(?:\s[^>]*)?>([^<]*)<\/t>/g)].map(
        (m) => decodeEntities(m[1]),
      )
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
    const raw = vMatch ? vMatch[1] : "";

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
  if (!headerRow) return { entries: [], usesDefaultPricing: false };

  const columnLetters = Array.from(new Set(sortedRows.flatMap((row) => [...(rows.get(row)?.keys() ?? [])])));
  const headers = columnLetters.map((column) => String(headerRow.get(column) ?? ""));
  const indexes = getPricingHeaderIndexes(headers);
  if (!indexes) return { entries: [], usesDefaultPricing: false };

  let usesDefaultPricing = false;
  const entries = sortedRows.slice(1).reduce<PricingEntry[]>((entries, rowNum) => {
    const row = rows.get(rowNum);
    const material = String(row?.get(columnLetters[indexes.material]) ?? "").trim();
    const almatyPrice = parseNumber(String(row?.get(columnLetters[indexes.almaty]) ?? ""));
    if (!material || almatyPrice === null || almatyPrice <= 0) return entries;

    const astanaPrice = indexes.astana === -1
      ? null
      : parseNumber(String(row?.get(columnLetters[indexes.astana]) ?? ""));
    const resolvedAstanaPrice = astanaPrice && astanaPrice > 0
      ? astanaPrice
      : getDefaultAstanaPrice(material);
    if (!astanaPrice || astanaPrice <= 0) usesDefaultPricing = resolvedAstanaPrice > 0 || usesDefaultPricing;
    if (resolvedAstanaPrice <= 0) return entries;

    entries.push({
      material,
      pricePerM2: almatyPrice,
      astanaPricePerM2: resolvedAstanaPrice,
      currency: "KZT",
    });
    return entries;
  }, []);

  return { entries, usesDefaultPricing };
}

function parseNumber(raw: string): number | null {
  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/[^0-9,.-]/g, "")
    .replace(/,/g, ".");

  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

type PricingHeaderIndexes = {
  material: number;
  almaty: number;
  astana: number;
};

type ParsedPricingData = {
  entries: PricingEntry[];
  usesDefaultPricing: boolean;
};

function getPricingHeaderIndexes(headers: string[]): PricingHeaderIndexes | null {
  const normalized = headers.map(normalizeText);
  const material = normalized.findIndex((header) =>
    ["material", "maaterial", "name", "title", "type", "variant", "материал", "название", "вид"].includes(header) ||
    header.includes("material") ||
    header.includes("материал")
  );
  const almaty = normalized.findIndex((header) =>
    ["almatypriceperm2", "priceperm2almaty", "priceperm2", "pricepermeter", "price", "costperm2", "cost", "value", "цена", "ценазаm2", "ценазаm²", "стоимость"].includes(header)
  );
  const astana = normalized.findIndex((header) =>
    ["astanapriceperm2", "priceperm2astana"].includes(header)
  );

  return material === -1 || almaty === -1
    ? null
    : { material, almaty, astana };
}

function getDefaultAstanaPrice(material: string): number {
  const lookup = canonicalMaterialKey(material);
  return DEFAULT_PRICING.find((entry) => canonicalMaterialKey(entry.material) === lookup)?.astanaPricePerM2
    ?? 0;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parsePricingCsv(csv: string): ParsedPricingData {
  const sanitized = csv.replace(/^\uFEFF/, "");
  const rows = sanitized
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map(parseCsvLine);

  if (rows.length === 0) return { entries: [], usesDefaultPricing: false };

  const indexes = getPricingHeaderIndexes(rows[0]);
  if (!indexes) return { entries: [], usesDefaultPricing: false };

  let usesDefaultPricing = false;
  const entries = rows.slice(1).reduce<PricingEntry[]>((acc, row) => {
    const material = row[indexes.material]?.trim();
    const price = parseNumber(row[indexes.almaty] ?? "");
    const astanaPrice = indexes.astana === -1
      ? null
      : parseNumber(row[indexes.astana] ?? "");

    if (!material || price === null || price <= 0) return acc;
    const resolvedAstanaPrice = astanaPrice && astanaPrice > 0
      ? astanaPrice
      : getDefaultAstanaPrice(material);
    if (!astanaPrice || astanaPrice <= 0) usesDefaultPricing = resolvedAstanaPrice > 0 || usesDefaultPricing;
    if (resolvedAstanaPrice <= 0) return acc;

    acc.push({
      material,
      pricePerM2: price,
      astanaPricePerM2: resolvedAstanaPrice,
      currency: "KZT",
    });
    return acc;
  }, []);

  return { entries, usesDefaultPricing };
}

function usesPricingFallback(parsed: ParsedPricingData): boolean {
  if (parsed.usesDefaultPricing) return true;
  const parsedMaterials = new Set(parsed.entries.map((entry) => canonicalMaterialKey(entry.material)));
  return DEFAULT_PRICING.some((entry) => !parsedMaterials.has(canonicalMaterialKey(entry.material)));
}

export async function getPricingDataWithSource(): Promise<PricingData> {
  const sourceUrl =
    normalizeGoogleSheetsUrl(process.env.GOOGLE_SHEETS_CSV_URL?.trim() || "") ||
    normalizeGoogleSheetsUrl(process.env.PRICING_SHEET_URL?.trim() || "");

  if (!sourceUrl) {
    console.warn("[pricing] Pricing source URL is not configured, using approved fallback prices");
    return { pricing: DEFAULT_PRICING, source: "default" };
  }

  const downloadUrl = toExcelDownloadUrl(sourceUrl);

  try {
    const raw = await fetchBinary(downloadUrl);

    // XLSX (ZIP) — распаковка и парсинг
    if (isPkgZip(raw)) {
      const parsedXlsx = parsePricingXlsx(raw);
      if (parsedXlsx.entries.length > 0) {
        return {
          pricing: parsedXlsx.entries,
          source: usesPricingFallback(parsedXlsx) ? "default" : "google-sheets",
        };
      }
      console.warn("[pricing] XLSX распознан, но пуст/не разобран, fallback CSV");
      return { pricing: DEFAULT_PRICING, source: "default" };
    }

    // CSV / текст — старая логика
    const csv = decodeUtf8(raw);
    const parsed = parsePricingCsv(csv);
    if (parsed.entries.length > 0) {
      return {
        pricing: parsed.entries,
        source: usesPricingFallback(parsed) ? "default" : "google-sheets",
      };
    }
    console.warn("[pricing] CSV has no valid pricing rows, using approved fallback prices");
    return { pricing: DEFAULT_PRICING, source: "default" };
  } catch (error) {
    console.warn("[pricing] Не удалось загрузить цены из внешнего источника, используется fallback:", error);
    return { pricing: DEFAULT_PRICING, source: "default" };
  }
}

export async function getPricingData(): Promise<PricingEntry[]> {
  const { pricing } = await getPricingDataWithSource();
  return pricing;
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
  if (!lookup) {
    return city === "Астана"
      ? DEFAULT_PRICING[0].astanaPricePerM2
      : DEFAULT_PRICING[0].pricePerM2;
  }

  const match = pricing.find((entry) => canonicalMaterialKey(entry.material) === lookup);
  if (match) {
    return city === "Астана" ? match.astanaPricePerM2 : match.pricePerM2;
  }

  const fallback = DEFAULT_PRICING.find((entry) => canonicalMaterialKey(entry.material) === lookup)
    ?? DEFAULT_PRICING[0];
  if (city === "Астана") {
    return fallback.astanaPricePerM2;
  }
  return fallback.pricePerM2;
}

export function formatCityPrice(value: number, city: "Алматы" | "Астана"): string {
  const prefix = city === "Астана" ? "от " : "";
  return `${prefix}${value.toLocaleString("ru-RU")} ₸/м²`;
}
