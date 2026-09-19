import { SplitPayment, UPIPayment, SplitStrategy } from '../types/upi';
import { WorkflowStep } from '../components/WorkflowProgress';

const SESSION_STORAGE_KEY = 'splitpay_active_session';
const RETURN_STORAGE_KEY = 'splitpay_pending_upi_return';

export interface ActiveSessionData {
  step: WorkflowStep;
  inputTab: 'manual' | 'qr';
  originalPayment: UPIPayment | null;
  hasOriginalAmount: boolean;
  totalAmount: number;
  strategy: SplitStrategy;
  maxAmount: number;
  equalParts: number;
  customAmounts: number[];
  preserveReference: boolean;
  pendingSplitAmounts: number[];
  showConfirmModal: boolean;
  splitPayments: SplitPayment[];
  currentRecordId: string | null;
  activeView: 'split' | 'history';
  lastUpdated?: number;
}

export function getActiveSession(): ActiveSessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic validation
    if (parsed && typeof parsed === 'object') {
      return parsed as ActiveSessionData;
    }
    return null;
  } catch (e) {
    console.error('Failed to load active session:', e);
    return null;
  }
}

export function saveActiveSession(session: ActiveSessionData): void {
  if (typeof window === 'undefined') return;
  try {
    // Only persist if there is meaningful data (e.g. originalPayment is present or past upload)
    if (session.originalPayment || session.step !== 'upload' || session.splitPayments.length > 0) {
      const dataToSave = {
        ...session,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(dataToSave));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save active session:', e);
  }
}

export function clearActiveSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(RETURN_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear active session:', e);
  }
}

export interface PendingUPIReturn {
  paymentId: string;
  recordId: string | null;
  partIndex: number;
  timestamp: number;
}

export function setPendingUPIReturn(data: PendingUPIReturn): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RETURN_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to set pending UPI return:', e);
  }
}

export function getPendingUPIReturn(): PendingUPIReturn | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RETURN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingUPIReturn;
  } catch {
    return null;
  }
}

export function clearPendingUPIReturn(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RETURN_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
