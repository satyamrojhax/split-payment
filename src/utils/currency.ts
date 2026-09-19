/**
 * Currency utilities for Indian Rupee (INR) and integer paise calculations.
 * Avoids JavaScript floating-point errors by keeping calculations strictly in integer paise.
 */

/**
 * Converts a rupee amount (e.g. 1999.50) into an exact integer number of paise (e.g. 199950).
 */
export function toPaise(rupees: number): number {
  if (isNaN(rupees) || !isFinite(rupees)) return 0;
  return Math.round(rupees * 100);
}

/**
 * Converts integer paise back to rupees (e.g. 199950 -> 1999.5).
 */
export function toRupees(paise: number): number {
  return Number((paise / 100).toFixed(2));
}

/**
 * Formats rupee amount into standard Indian currency format (e.g. ₹7,000 or ₹1,999.50).
 */
export function formatINR(amount: number, includeSymbol = true): string {
  if (isNaN(amount)) return includeSymbol ? '₹0' : '0';
  
  const hasDecimals = Math.round(amount * 100) % 100 !== 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Formats paise into Indian currency string.
 */
export function formatPaise(paise: number, includeSymbol = true): string {
  return formatINR(toRupees(paise), includeSymbol);
}
