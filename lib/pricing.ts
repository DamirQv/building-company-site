import { unzipSync } from "fflate";

export type PricingEntry = {
  material: string;
  pricePerM2: number;
  currency?: string;
};

/**
 * Актуальные цены (fallback) — совпадают со значениями в Excel Online.
 * Используются, когда внешний источник временно недоступен.
 */
export const DEFAULT_PRICING: PricingEntry[] = [
  { material: "Финблок", pricePerM2: 155000, currency: "KZT" },
  { material: "Газоблок", pricePerM2: 135000, currency: "KZT" },
  { material: "Кирпич", pricePerM2: 140000, currency: "KZT" },
  { material: "Не определился", pricePerM2: 135000, currency: "KZT" },
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
  финблок: "finnblock",
  фінблок: "finnblock",
  фиблоблок: "finnblock",
  газобетон: "газоблок",
};

function canonicalMaterialKey(material: string): string {
  const key = normalizeText(material);
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
function parsePricingXlsx(data: Uint8Array): PricingEntry[] {
  const files = unzipSync(data);

  const sheetName = Object.keys(files).find((name) =>
    /xl\/worksheets\/sheet1\.xml$/i.test(name),
  );
  const stringsName = Object.keys(files).find((name) =>
    /xl\/sharedStrings\.xml$/i.test(name),
  );

  if (!sheetName) return [];

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

  const entries: PricingEntry[] = [];
  const sortedRows = Array.from(rows.keys()).sort((a, b) => a - b);

  for (const rowNum of sortedRows) {
    if (rowNum === 1) continue; // строка заголовков
    const rowCells = rows.get(rowNum)!;
    const material = rowCells.get("A");
    const price = rowCells.get("B");

    if (typeof material === "string" && material.trim()) {
      const priceValue =
        typeof price === "number" ? price : parseNumber(String(price ?? "")) ?? 0;
      entries.push({
        material: material.trim(),
        pricePerM2: priceValue,
        currency: "KZT",
      });
    }
  }

  const valid = entries.filter((e) => e.material && e.pricePerM2 > 0);
  return valid.length > 0 ? valid : [];
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

function parsePricingCsv(csv: string): PricingEntry[] {
  const sanitized = csv.replace(/^\uFEFF/, "");
  const rows = sanitized
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map(parseCsvLine);

  if (rows.length === 0) return DEFAULT_PRICING;

  const headers = rows[0].map((header) => normalizeText(header));
  const materialIndex = headers.findIndex((header) =>
    ["material", "maaterial", "name", "title", "type", "variant", "материал", "название", "вид"].includes(header) ||
    header.includes("material") ||
    header.includes("материал")
  );
  const priceIndex = headers.findIndex((header) =>
    ["priceperm2", "pricepermeter", "price", "costperm2", "cost", "value", "цена", "ценазаm2", "ценазаm²", "стоимость"].includes(header) ||
    header.includes("price") ||
    header.includes("cost") ||
    header.includes("цен") ||
    header.includes("стоимость")
  );

  if (materialIndex === -1 || priceIndex === -1) {
    return DEFAULT_PRICING;
  }

  const entries = rows.slice(1).reduce<PricingEntry[]>((acc, row) => {
    const material = row[materialIndex]?.trim();
    const price = parseNumber(row[priceIndex] ?? "");

    if (!material || price === null || price <= 0) return acc;

    acc.push({ material, pricePerM2: price, currency: "KZT" });
    return acc;
  }, []);

  return entries.length > 0 ? entries : DEFAULT_PRICING;
}

export async function getPricingData(): Promise<PricingEntry[]> {
  const sourceUrl =
    normalizeGoogleSheetsUrl(process.env.PRICING_SHEET_URL?.trim() || "") ||
    normalizeGoogleSheetsUrl(process.env.GOOGLE_SHEETS_CSV_URL?.trim() || "");

  if (!sourceUrl) {
    return DEFAULT_PRICING;
  }

  const downloadUrl = toExcelDownloadUrl(sourceUrl);

  try {
    const raw = await fetchBinary(downloadUrl);

    // XLSX (ZIP) — распаковка и парсинг
    if (isPkgZip(raw)) {
      const parsedXlsx = parsePricingXlsx(raw);
      if (parsedXlsx.length > 0) return parsedXlsx;
      console.warn("[pricing] XLSX распознан, но пуст/не разобран, fallback CSV");
      return DEFAULT_PRICING;
    }

    // CSV / текст — старая логика
    const csv = decodeUtf8(raw);
    const parsed = parsePricingCsv(csv);
    return parsed.length > 0 ? parsed : DEFAULT_PRICING;
  } catch (error) {
    console.warn("[pricing] Не удалось загрузить цены из внешнего источника, используется fallback:", error);
    return DEFAULT_PRICING;
  }
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₸/м²`;
}

export function resolveMaterialPrice(material: string | undefined, pricing: PricingEntry[]): number {
  const lookup = canonicalMaterialKey(material ?? "");
  if (!lookup) {
    return DEFAULT_PRICING[0]?.pricePerM2 ?? 155000;
  }

  const match = pricing.find((entry) => canonicalMaterialKey(entry.material) === lookup);
  if (match) {
    return match.pricePerM2;
  }

  const fallback = pricing.find((entry) => canonicalMaterialKey(entry.material) === "finnblock");
  return fallback?.pricePerM2 ?? DEFAULT_PRICING[0]?.pricePerM2 ?? 155000;
}
