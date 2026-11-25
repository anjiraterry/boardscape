/**
 * Monetary utilities using integer minor units (NGN kobo) per ADR-003.
 * 1 NGN = 100 kobo. Never store or compute commercial totals in floats.
 */

export type CurrencyCode = "NGN";

export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

export function ngnToKobo(naira: number): number {
  if (!Number.isFinite(naira) || naira < 0) {
    throw new RangeError("Amount must be a non-negative finite number");
  }
  return Math.round(naira * 100);
}

export function formatNgnFromKobo(amountMinor: number): string {
  const naira = amountMinor / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
  }).format(naira);
}

export function sumMoneyMinor(items: number[]): number {
  return items.reduce((acc, val) => {
    if (!Number.isInteger(val) || val < 0) {
      throw new RangeError("Line item minor units must be non-negative integers");
    }
    return acc + val;
  }, 0);
}
