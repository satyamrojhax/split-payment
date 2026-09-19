import { HistoryRecord } from '../types/history';
import { SplitPayment } from '../types/upi';

const STORAGE_KEY = 'splitpay_history_records';

export function getHistoryRecords(): HistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to load history:', e);
    return [];
  }
}

export function saveHistoryRecord(record: HistoryRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getHistoryRecords();
    // Prepend new record, avoid duplicate ID
    const filtered = existing.filter((r) => r.id !== record.id);
    const updated = [record, ...filtered].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history record:', e);
  }
}

export function updateRecordPayments(
  recordId: string,
  splitPayments: SplitPayment[]
): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getHistoryRecords();
    const updated = existing.map((r) =>
      r.id === recordId ? { ...r, splitPayments } : r
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update history payments:', e);
  }
}

export function deleteHistoryRecord(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getHistoryRecords();
    const filtered = existing.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete history record:', e);
  }
}

export function clearAllHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}
