/**
 * SplitPay UPI Type Definitions
 * Represents UPI payment structures, parsed parameters, and split configurations.
 */

export interface UPIPayment {
  pa: string;              // Payee UPI ID (e.g. merchant@upi)
  pn?: string;             // Payee Name (e.g. ABC Store)
  mc?: string;             // Merchant Category Code
  tr?: string;             // Transaction reference ID
  tn?: string;             // Transaction note
  am?: number;             // Amount in rupees (e.g. 7000)
  mam?: number;            // Minimum acceptable amount
  cu: 'INR';               // Currency (only INR supported)
  url?: string;            // Merchant reference URL
  mode?: string;           // Payment mode
  purpose?: string;        // Payment purpose
  orgid?: string;          // Organising ID
  originalUri: string;     // Raw UPI string
  rawParams: Record<string, string>; // Preserved original parameters
}

export interface SplitPayment {
  id: string;
  index: number;
  amount: number;          // Rupees (e.g. 1999)
  amountPaise: number;     // Integer paise (e.g. 199900)
  uri: string;             // Generated upi://pay URI
  qrDataUrl?: string;      // High-res PNG data URL for downloading/sharing
  qrSvg?: string;          // SVG string for crystal-clear vector rendering
  status: 'pending' | 'opened' | 'completed';
  referenceId: string;     // Part reference
}

export type SplitStrategy = 'max_amount' | 'balanced' | 'equal' | 'custom';

export interface SplitPayState {
  step: 'upload' | 'configure' | 'confirm' | 'results';
  originalPayment: UPIPayment | null;
  totalAmount: number;     // Total in rupees
  splitStrategy: SplitStrategy;
  maxAmountPerPayment: number;
  equalPartsCount: number;
  customAmounts: number[];
  splitPayments: SplitPayment[];
  privacyMode: boolean;
  preserveReferenceId: boolean;
}
