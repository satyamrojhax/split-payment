import React, { useState } from 'react';
import { Download, Printer, ArrowLeft, Archive, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import { SplitPayment, UPIPayment } from '../types/upi';
import { formatINR } from '../utils/currency';
import { PaymentCard } from './PaymentCard';
import { downloadAllQRsZip } from '../lib/zipExporter';

interface SplitResultsViewProps {
  originalPayment: UPIPayment;
  payments: SplitPayment[];
  totalAmount: number;
  onStatusChange: (id: string, newStatus: 'pending' | 'opened' | 'completed') => void;
  onModifySplit: () => void;
  onResetAll: () => void;
}

export const SplitResultsView: React.FC<SplitResultsViewProps> = ({
  originalPayment,
  payments,
  totalAmount,
  onStatusChange,
  onModifySplit,
  onResetAll,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const completedCount = payments.filter((p) => p.status === 'completed').length;
  const isAllCompleted = completedCount === payments.length && payments.length > 0;

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadAllQRsZip(payments, originalPayment);
    } catch (err) {
      console.error('ZIP error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 text-left">
      {/* Top Banner: Overview & Quick Actions */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 p-4 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                {payments.length} Payments Generated
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {originalPayment.pn || 'UPI Receiver'}
            </h2>
            <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-0.5 break-all">
              {originalPayment.pa}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Total Amount */}
            <div className="bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 rounded-xl sm:text-right border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider block">
                Total Split
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
                {formatINR(totalAmount)}
              </span>
            </div>

            {/* Batch Action Buttons: Download ZIP & Print */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isZipping}
                id="btn-download-all-zip"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-xs min-h-[44px] cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isZipping ? 'Downloading...' : 'Download ZIP'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                id="btn-print-summary"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:border-black dark:hover:border-white transition min-h-[44px] cursor-pointer"
                title="Print payment sheets"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Tracker & Quick Navigation */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-300"
                style={{
                  width: `${(completedCount / payments.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-bold text-neutral-900 dark:text-white shrink-0 flex items-center gap-1">
              {isAllCompleted && <CheckCircle className="w-3.5 h-3.5 text-black dark:text-white" />}
              <span>{completedCount} of {payments.length} Completed</span>
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={onModifySplit}
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition py-2 px-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Split</span>
            </button>
            <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">|</span>
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              id="btn-cancel-split-top"
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900 flex items-center gap-1.5 transition py-2 px-3 rounded-xl cursor-pointer min-h-[44px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cancel Split</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Generated Payment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 no-print">
        {payments.map((payment) => (
          <PaymentCard
            key={payment.id}
            payment={payment}
            originalPayment={originalPayment}
            totalPaymentsCount={payments.length}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      {/* Prominent Session Management Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 no-print shadow-xs">
        <div className="text-center sm:text-left">
          <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
            <span>Session Persistence Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Your progress is saved locally. If you refresh or return later, this split will stay open.
          </p>
        </div>

        {/* Dedicated Cancel / Clear Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onModifySplit}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition min-h-[44px] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modify Amounts</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            id="btn-clear-data-bottom"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold transition min-h-[44px] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Cancel & Clear Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal to Cancel Split / Clear Data */}
      {showCancelConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 no-print"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Cancel Split & Clear Data?
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  This will reset the payment workflow.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
              Your active split session and generated QR codes will be cleared from your browser cache.
              (Past entries already saved in Split History will remain intact).
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-xl border border-neutral-300 dark:border-neutral-700 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition min-h-[44px] cursor-pointer"
              >
                Keep Active Split
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(false);
                  onResetAll();
                }}
                id="btn-confirm-cancel-split"
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 py-3 text-xs font-bold text-white transition min-h-[44px] cursor-pointer shadow-xs"
              >
                Yes, Clear & Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

