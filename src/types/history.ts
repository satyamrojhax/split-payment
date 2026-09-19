import { SplitPayment, SplitStrategy, UPIPayment } from './upi';

export interface HistoryRecord {
  id: string;
  createdAt: string; // ISO string
  payeeName: string;
  payeeVPA: string;
  totalAmount: number;
  strategy: SplitStrategy;
  splitPayments: SplitPayment[];
  originalPayment: UPIPayment;
}
