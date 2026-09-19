/**
 * Validation utilities for SplitPay.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates UPI ID / VPA structure (username@handle).
 * Note: Structural validation only — does not guarantee that the UPI ID actually exists at NPCI.
 */
export function isValidUPIId(upiId: string): boolean {
  if (!upiId || typeof upiId !== 'string') return false;
  const trimmed = upiId.trim();
  // Standard NPCI UPI VPA format: alphanumeric and allowed dots/hyphens/underscores followed by @ and PSP handle
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9]{2,64}$/;
  return upiRegex.test(trimmed);
}

/**
 * Validates currency parameter. Only INR is supported by UPI.
 */
export function validateCurrency(cu?: string): ValidationResult {
  if (!cu) {
    return { isValid: true }; // UPI defaults to INR if omitted in many standard QR specifications
  }
  if (cu.toUpperCase() !== 'INR') {
    return {
      isValid: false,
      error: `Unsupported currency '${cu}'. SplitPay currently supports INR only.`,
    };
  }
  return { isValid: true };
}

/**
 * Validates amount is positive and reasonable.
 */
export function validateAmount(amount: number): ValidationResult {
  if (isNaN(amount) || amount <= 0) {
    return {
      isValid: false,
      error: 'Please enter a valid amount greater than ₹0.',
    };
  }
  if (amount > 1000000) {
    return {
      isValid: false,
      error: 'Amount exceeds typical UPI single-transaction limits (₹10,00,000).',
    };
  }
  return { isValid: true };
}
