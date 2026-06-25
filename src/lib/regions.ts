// Region + currency helpers. hrToolkit is curated for India, the US, Europe/UK,
// the Middle East and Africa — the active region drives currency formatting for
// the generic calculators. Region-specific calculators carry their own currency.

export type RegionId = "IN" | "US" | "UK" | "EU" | "AE" | "SA" | "ZA" | "NG";

export interface Region {
  id: RegionId;
  label: string;
  flag: string;
  currency: string; // ISO 4217
  symbol: string;
  locale: string;
}

export const REGIONS: Region[] = [
  { id: "IN", label: "India", flag: "🇮🇳", currency: "INR", symbol: "₹", locale: "en-IN" },
  { id: "US", label: "United States", flag: "🇺🇸", currency: "USD", symbol: "$", locale: "en-US" },
  { id: "UK", label: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£", locale: "en-GB" },
  { id: "EU", label: "Europe", flag: "🇪🇺", currency: "EUR", symbol: "€", locale: "de-DE" },
  { id: "AE", label: "UAE", flag: "🇦🇪", currency: "AED", symbol: "د.إ", locale: "en-AE" },
  { id: "SA", label: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", symbol: "﷼", locale: "en-SA" },
  { id: "ZA", label: "South Africa", flag: "🇿🇦", currency: "ZAR", symbol: "R", locale: "en-ZA" },
  { id: "NG", label: "Nigeria", flag: "🇳🇬", currency: "NGN", symbol: "₦", locale: "en-NG" },
];

export const regionById = (id: RegionId): Region =>
  REGIONS.find((r) => r.id === id) ?? REGIONS[0];

/** Format a number as currency for a region. */
export function money(value: number, region: Region, opts?: { decimals?: number }): string {
  if (!isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat(region.locale, {
      style: "currency",
      currency: region.currency,
      maximumFractionDigits: opts?.decimals ?? 0,
      minimumFractionDigits: opts?.decimals ?? 0,
    }).format(value);
  } catch {
    return `${region.symbol}${value.toLocaleString()}`;
  }
}

/** Plain grouped number (no currency symbol). */
export function num(value: number, region: Region, decimals = 0): string {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat(region.locale, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}
