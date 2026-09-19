import React, { useState } from 'react';
import { Download, Printer, RefreshCw, ArrowLeft, Archive, CheckCircle } from 'lucide-react';
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

        {/* Progress Tracker */}
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
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition py-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Change Split</span>
            </button>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <button
              type="button"
              onClick={onResetAll}
              className="text-xs font-semibold text-neutral-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition py-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>New Payment</span>
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

      {/* Minimal Privacy Notice */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 no-print">
        <span>Processed 100% on your device. Closing this tab clears all data.</span>
        <button
          type="button"
          onClick={onResetAll}
          className="text-xs font-semibold text-neutral-900 dark:text-white hover:underline ml-2 shrink-0"
        >
          Clear Data
        </button>
      </div>
    </div>
  );
};
