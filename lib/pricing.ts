export type PricingEntry = {
  material: string;
  pricePerM2: number;
  currency?: string;
};

export const DEFAULT_PRICING: PricingEntry[] = [
  { material: "FinnBlock", pricePerM2: 135000, currency: "KZT" },
  { material: "Газоблок", pricePerM2: 150000, currency: "KZT" },
  { material: "Кирпич", pricePerM2: 180000, currency: "KZT" },
  { material: "Не определился", pricePerM2: 150000, currency: "KZT" },
];

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-zа-я0-9]+/g, "");
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
    ["material", "name", "title", "type", "variant", "материал", "название", "вид"].includes(header) ||
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
  const sourceUrl = normalizeGoogleSheetsUrl(process.env.GOOGLE_SHEETS_CSV_URL?.trim() || process.env.PRICING_SHEET_URL?.trim() || "");

  if (!sourceUrl) {
    return DEFAULT_PRICING;
  }

  try {
    const res = await fetch(sourceUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`Pricing fetch failed: ${res.status}`);
    const csv = await res.text();
    const parsed = parsePricingCsv(csv);
    return parsed.length > 0 ? parsed : DEFAULT_PRICING;
  } catch (error) {
    console.warn("[pricing] Не удалось загрузить цены из Google Sheets, используется fallback:", error);
    return DEFAULT_PRICING;
  }
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₸/м²`;
}

export function resolveMaterialPrice(material: string | undefined, pricing: PricingEntry[]): number {
  const lookup = normalizeText(material ?? "");
  if (!lookup) {
    return DEFAULT_PRICING[0]?.pricePerM2 ?? 135000;
  }

  const match = pricing.find((entry) => normalizeText(entry.material) === lookup);
  if (match) {
    return match.pricePerM2;
  }

  const fallback = pricing.find((entry) => normalizeText(entry.material) === "finnblock");
  return fallback?.pricePerM2 ?? DEFAULT_PRICING[0]?.pricePerM2 ?? 135000;
}
