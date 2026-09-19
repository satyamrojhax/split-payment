import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Trash2, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  RotateCcw,
  Sparkles,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoryRecord } from '../types/history';
import { formatINR } from '../utils/currency';

interface HistoryPageProps {
  records: HistoryRecord[];
  onResumeSplit: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onStartNewSplit: () => void;
  onToggleStatusInHistory?: (recordId: string, paymentId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  records,
  onResumeSplit,
  onDeleteRecord,
  onClearAll,
  onStartNewSplit,
  onToggleStatusInHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Format date readable
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  // Filter records
  const filtered = records.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.payeeName.toLowerCase().includes(q) ||
      r.payeeVPA.toLowerCase().includes(q) ||
      r.totalAmount.toString().includes(q)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-4xl mx-auto space-y-6 text-left pb-12"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
              On-Device Storage
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              • {records.length} {records.length === 1 ? 'Split' : 'Splits'} saved
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Split History
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Track and resume your split UPI payments. All records stay 100% on your device.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConfirmClear(true)}
              id="btn-clear-all-history"
              className="px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 border border-neutral-200 dark:border-neutral-800 hover:border-red-200 dark:hover:border-red-900 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStartNewSplit}
            id="btn-history-new-split"
            className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ New Split</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Banner */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 flex flex-col sm:flex-row items-center justify-between gap-3 overflow-hidden"
          >
            <div className="text-xs text-neutral-700 dark:text-neutral-300">
              <span className="font-bold text-neutral-900 dark:text-white">
                Clear all past splits?
              </span>{' '}
              This will permanently delete saved history from your device storage.
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowConfirmClear(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-xs"
              >
                Yes, Delete All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input */}
      {records.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Payee, UPI ID, or Amount..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-xs sm:text-sm focus:outline-none focus:border-black dark:focus:border-white transition"
          />
        </div>
      )}

      {/* Empty State */}
      {records.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-10 sm:p-14 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            No Split History Yet
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mt-2 leading-relaxed">
            Whenever you split a UPI payment, it automatically saves here on your device. You can track payment completion and resume at any time.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onStartNewSplit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition shadow-xs cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Split a Payment Now</span>
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No splits found matching "{searchQuery}"
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 text-xs font-bold text-black dark:text-white underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* List of History Records */
        <div className="space-y-4">
          {filtered.map((record) => {
            const completedCount = record.splitPayments.filter(
              (p) => p.status === 'completed'
            ).length;
            const totalParts = record.splitPayments.length;
            const isAllCompleted = completedCount === totalParts && totalParts > 0;
            const isExpanded = expandedId === record.id;

            return (
              <motion.div
                key={record.id}
                layout
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isAllCompleted
                    ? 'bg-neutral-50/70 dark:bg-neutral-900/50 border-neutral-300 dark:border-neutral-700'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs'
                }`}
              >
                {/* Main Card Summary */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Payee Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                          {formatDate(record.createdAt)}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">•</span>
                        <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                          {record.strategy} split
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <span>{record.payeeName || 'UPI Receiver'}</span>
                        {isAllCompleted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Paid</span>
                          </span>
                        )}
                      </h3>
                      <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                        {record.payeeVPA}
                      </p>
                    </div>

                    {/* Amount & Progress */}
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100 dark:border-neutral-800">
                      <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                        {formatINR(record.totalAmount)}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          {completedCount}/{totalParts} Completed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black dark:bg-white transition-all duration-300"
                      style={{
                        width: `${(completedCount / totalParts) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Bottom Card Controls */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                      className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer transition"
                    >
                      <span>{isExpanded ? 'Hide parts' : `View ${totalParts} parts`}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(record.id)}
                        title="Delete this record"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onResumeSplit(record)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition cursor-pointer shadow-xs"
                      >
                        <span>Open & Pay</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Inline Payment Parts List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-5"
                    >
                      <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                        Split Payment Parts:
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {record.splitPayments.map((p) => {
                          const partCompleted = p.status === 'completed';
                          return (
                            <div
                              key={p.id}
                              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                                partCompleted
                                  ? 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700'
                                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                              }`}
                            >
                              <div>
                                <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                                  Part {p.index} of {record.splitPayments.length}
                                </span>
                                <div className="text-base font-extrabold text-neutral-900 dark:text-white">
                                  {formatINR(p.amount)}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Toggle switch directly in history item */}
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={partCompleted}
                                  onClick={() =>
                                    onToggleStatusInHistory?.(record.id, p.id)
                                  }
                                  title={`Toggle part ${p.index} status`}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer select-none ${
                                    partCompleted
                                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700'
                                  }`}
                                >
                                  <span
                                    className={`relative inline-block w-5 h-3 rounded-full transition-colors ${
                                      partCompleted
                                        ? 'bg-white/40 dark:bg-black/40'
                                        : 'bg-neutral-300 dark:bg-neutral-600'
                                    }`}
                                  >
                                    <span
                                      className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full transition-transform ${
                                        partCompleted
                                          ? 'translate-x-2 bg-white dark:bg-black'
                                          : 'translate-x-0 bg-white dark:bg-neutral-200'
                                      }`}
                                    />
                                  </span>
                                  <span>{partCompleted ? 'Paid' : 'Pending'}</span>
                                </button>

                                <a
                                  href={p.uri}
                                  className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition text-neutral-700 dark:text-neutral-300"
                                  title="Pay now via UPI app"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onResumeSplit(record)}
                          className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open full QR view with Download & Print →</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
