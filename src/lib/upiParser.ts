import { UPIPayment } from '../types/upi';
import { isValidUPIId, validateCurrency } from '../utils/validation';

export interface ParseResult {
  success: boolean;
  payment?: UPIPayment;
  error?: string;
  hasAmount: boolean;
}

/**
 * Dedicated parser for UPI payment URIs.
 * Handles upi://pay scheme according to NPCI UPI specifications while defending
 * against malicious URI schemes (javascript:, http:, intent:, data:, etc.).
 */
export function parseUPIUri(rawUri: string): ParseResult {
  if (!rawUri || typeof rawUri !== 'string') {
    return {
      success: false,
      hasAmount: false,
      error: 'Empty or invalid QR content.',
    };
  }

  const trimmed = rawUri.trim();

  // Threat model check: strictly accept only upi://pay scheme
  if (!trimmed.toLowerCase().startsWith('upi://pay')) {
    return {
      success: false,
      hasAmount: false,
      error: "This doesn't appear to be a UPI payment QR. Expected a 'upi://pay' payment format.",
    };
  }

  try {
    // Find query string after upi://pay? or upi://pay
    const queryIndex = trimmed.indexOf('?');
    if (queryIndex === -1) {
      return {
        success: false,
        hasAmount: false,
        error: 'The payment address could not be detected.',
      };
    }

    const queryString = trimmed.slice(queryIndex + 1);
    const searchParams = new URLSearchParams(queryString);

    // Extract all supported parameters
    const rawParams: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      rawParams[key.toLowerCase()] = val;
    });

    const pa = rawParams['pa']?.trim() || '';
    if (!pa) {
      return {
        success: false,
        hasAmount: false,
        error: 'The payment address (UPI ID) could not be detected.',
      };
    }

    // Validate UPI ID structure
    if (!isValidUPIId(pa)) {
      return {
        success: false,
        hasAmount: false,
        error: `Invalid UPI ID format: '${pa}'. Valid format is username@handle.`,
      };
    }

    // Currency check
    const cu = (rawParams['cu'] || 'INR').toUpperCase();
    const currencyValidation = validateCurrency(cu);
    if (!currencyValidation.isValid) {
      return {
        success: false,
        hasAmount: false,
        error: currencyValidation.error,
      };
    }

    // Amount extraction
    let amount: number | undefined = undefined;
    let hasAmount = false;
    if (rawParams['am'] !== undefined && rawParams['am'] !== '') {
      const parsedAmount = parseFloat(rawParams['am']);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        amount = Number(parsedAmount.toFixed(2));
        hasAmount = true;
      }
    }

    // Payee Name: unescape and sanitize
    const pn = rawParams['pn'] ? decodeURIComponent(rawParams['pn']) : undefined;

    const payment: UPIPayment = {
      pa,
      pn,
      mc: rawParams['mc'],
      tr: rawParams['tr'],
      tn: rawParams['tn'] ? decodeURIComponent(rawParams['tn']) : undefined,
      am: amount,
      mam: rawParams['mam'] ? parseFloat(rawParams['mam']) : undefined,
      cu: 'INR',
      url: rawParams['url'],
      mode: rawParams['mode'],
      purpose: rawParams['purpose'],
      orgid: rawParams['orgid'],
      originalUri: trimmed,
      rawParams,
    };

    return {
      success: true,
      payment,
      hasAmount,
    };
  } catch (err) {
    return {
      success: false,
      hasAmount: false,
      error: `Failed to parse UPI link: ${err instanceof Error ? err.message : 'Unknown parsing error'}`,
    };
  }
}
