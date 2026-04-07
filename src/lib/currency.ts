// TicketMatch.ai - Multi-currency support
// All prices in the database are stored in EUR. Conversion is display-only.
// Exchange rates are approximate/static. Live rates coming soon.

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rate: number; // rate FROM EUR (1 EUR = X of this currency)
  decimals: number;
  locale: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "EUR", symbol: "\u20ac", name: "Euro", flag: "\ud83c\uddea\ud83c\uddfa", rate: 1, decimals: 2, locale: "de-DE" },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "\ud83c\uddfa\ud83c\uddf8", rate: 1.09, decimals: 2, locale: "en-US" },
  { code: "GBP", symbol: "\u00a3", name: "British Pound", flag: "\ud83c\uddec\ud83c\udde7", rate: 0.86, decimals: 2, locale: "en-GB" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "\ud83c\udde8\ud83c\udded", rate: 0.97, decimals: 2, locale: "de-CH" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "\ud83c\uddf8\ud83c\uddea", rate: 11.50, decimals: 2, locale: "sv-SE" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "\ud83c\uddf3\ud83c\uddf4", rate: 11.80, decimals: 2, locale: "nb-NO" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "\ud83c\udde9\ud83c\uddf0", rate: 7.46, decimals: 2, locale: "da-DK" },
  { code: "PLN", symbol: "z\u0142", name: "Polish Zloty", flag: "\ud83c\uddf5\ud83c\uddf1", rate: 4.32, decimals: 2, locale: "pl-PL" },
  { code: "CZK", symbol: "K\u010d", name: "Czech Koruna", flag: "\ud83c\udde8\ud83c\uddff", rate: 25.30, decimals: 2, locale: "cs-CZ" },
  { code: "JPY", symbol: "\u00a5", name: "Japanese Yen", flag: "\ud83c\uddef\ud83c\uddf5", rate: 164.00, decimals: 0, locale: "ja-JP" },
  { code: "CNY", symbol: "\u00a5", name: "Chinese Yuan", flag: "\ud83c\udde8\ud83c\uddf3", rate: 7.90, decimals: 2, locale: "zh-CN" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "\ud83c\uddf8\ud83c\uddec", rate: 1.46, decimals: 2, locale: "en-SG" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "\ud83c\udde6\ud83c\uddfa", rate: 1.67, decimals: 2, locale: "en-AU" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "\ud83c\udde8\ud83c\udde6", rate: 1.49, decimals: 2, locale: "en-CA" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "\ud83c\udde7\ud83c\uddf7", rate: 5.45, decimals: 2, locale: "pt-BR" },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", flag: "\ud83c\uddf9\ud83c\uddfc", rate: 34.50, decimals: 0, locale: "zh-TW" },
  { code: "THB", symbol: "\u0e3f", name: "Thai Baht", flag: "\ud83c\uddf9\ud83c\udded", rate: 38.50, decimals: 2, locale: "th-TH" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "\ud83c\uddf2\ud83c\uddfe", rate: 5.10, decimals: 2, locale: "ms-MY" },
  { code: "KRW", symbol: "\u20a9", name: "South Korean Won", flag: "\ud83c\uddf0\ud83c\uddf7", rate: 1450.00, decimals: 0, locale: "ko-KR" },
  { code: "INR", symbol: "\u20b9", name: "Indian Rupee", flag: "\ud83c\uddee\ud83c\uddf3", rate: 90.50, decimals: 2, locale: "en-IN" },
];

export const CURRENCY_MAP: Record<string, CurrencyInfo> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c])
);

export function getCurrency(code: string): CurrencyInfo {
  return CURRENCY_MAP[code] || CURRENCY_MAP["EUR"];
}

/**
 * Convert an amount from EUR to a target currency
 */
export function convertFromEUR(amount: number, toCurrency: string): number {
  const currency = getCurrency(toCurrency);
  return amount * currency.rate;
}

/**
 * Convert an amount from a source currency back to EUR
 */
export function convertToEUR(amount: number, fromCurrency: string): number {
  const currency = getCurrency(fromCurrency);
  if (currency.rate === 0) return amount;
  return amount / currency.rate;
}

/**
 * Format a number as a currency string using Intl.NumberFormat
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode);
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(amount);
  } catch {
    // Fallback for unsupported locales
    const fixed = amount.toFixed(currency.decimals);
    return `${currency.symbol} ${fixed}`;
  }
}

/**
 * Convert from EUR and format in one step
 */
export function formatFromEUR(amountInEUR: number, currencyCode: string): string {
  const converted = convertFromEUR(amountInEUR, currencyCode);
  return formatCurrency(converted, currencyCode);
}
