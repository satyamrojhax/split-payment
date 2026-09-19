import { UPIPayment } from '../types/upi';

export interface BuildUPIOptions {
  amount: number;
  partIndex: number;
  totalParts: number;
  preserveReference?: boolean;
}

/**
 * Reconstructs a clean, valid upi://pay URI for a split transaction.
 * Preserves all original recipient metadata (pa, pn, mc, etc.) while updating the
 * amount and ensuring QR fidelity (never mangling @ to %40 in payee address).
 */
export function buildSplitUPIUri(
  original: UPIPayment,
  options: BuildUPIOptions
): { uri: string; referenceId: string } {
  const { amount, partIndex, totalParts, preserveReference = false } = options;

  // Format amount to maximum 2 decimal places (e.g. "1999" or "1999.50")
  const formattedAmount = Number(amount.toFixed(2)).toString();

  // Handle transaction reference (Section 39)
  let refId = '';
  if (original.tr) {
    if (preserveReference) {
      refId = original.tr;
    } else {
      // Append unique part identifier to avoid duplicate-reference issues on merchant side
      refId = `${original.tr}-P${partIndex}of${totalParts}`;
    }
  } else {
    // Generate distinct local reference ID for traceability
    refId = `SP-${Date.now().toString(36).toUpperCase()}-P${partIndex}`;
  }

  // Handle note (tn)
  let note = original.tn || '';
  if (note) {
    note = `${note} (Part ${partIndex}/${totalParts})`;
  } else if (original.pn) {
    note = `Payment to ${original.pn} (Part ${partIndex}/${totalParts})`;
  } else {
    note = `SplitPay Part ${partIndex}/${totalParts}`;
  }

  // Build query components carefully preserving exact format
  const queryParts: string[] = [];

  // Payee Address (pa) - Keep '@' unescaped for maximum compatibility with UPI apps
  queryParts.push(`pa=${encodeURIComponent(original.pa).replace(/%40/g, '@')}`);

  // Payee Name (pn)
  if (original.pn) {
    queryParts.push(`pn=${encodeURIComponent(original.pn)}`);
  }

  // Merchant Code (mc)
  if (original.mc) {
    queryParts.push(`mc=${encodeURIComponent(original.mc)}`);
  }

  // Transaction Reference (tr)
  if (refId) {
    queryParts.push(`tr=${encodeURIComponent(refId)}`);
  }

  // Transaction Note (tn)
  if (note) {
    queryParts.push(`tn=${encodeURIComponent(note)}`);
  }

  // Amount (am)
  queryParts.push(`am=${formattedAmount}`);

  // Currency (cu) - Always INR
  queryParts.push('cu=INR');

  // Preserve other harmless original params if present (mode, purpose, orgid)
  if (original.mode) {
    queryParts.push(`mode=${encodeURIComponent(original.mode)}`);
  }
  if (original.purpose) {
    queryParts.push(`purpose=${encodeURIComponent(original.purpose)}`);
  }
  if (original.orgid) {
    queryParts.push(`orgid=${encodeURIComponent(original.orgid)}`);
  }

  const uri = `upi://pay?${queryParts.join('&')}`;

  return { uri, referenceId: refId };
}
