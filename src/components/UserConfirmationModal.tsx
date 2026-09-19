import React from 'react';
import { ArrowRight, X, ArrowDown } from 'lucide-react';
import { UPIPayment } from '../types/upi';
import { formatINR } from '../utils/currency';

interface UserConfirmationModalProps {
  originalPayment: UPIPayment;
  splitAmounts: number[];
  totalAmount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isGenerating?: boolean;
}

export const UserConfirmationModal: React.FC<UserConfirmationModalProps> = ({
  originalPayment,
  splitAmounts,
  totalAmount,
  onConfirm,
  onCancel,
  isGenerating = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 overflow-y-auto text-left">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Confirm Payment Split
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Check recipient and amounts before generating QRs
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isGenerating}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source vs Destination Preview */}
        <div className="my-4 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            
            {/* Receiver */}
            <div className="flex-1 p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Receiver</span>
              <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                {originalPayment.pn || 'UPI Receiver'}
              </p>
              <p className="text-xs font-mono text-neutral-500 truncate">
                {originalPayment.pa}
              </p>
            </div>

            <div className="flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-neutral-400 hidden sm:block" />
              <ArrowDown className="w-4 h-4 text-neutral-400 sm:hidden" />
            </div>

            {/* Total */}
            <div className="flex-1 p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 sm:text-right">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Split</span>
              <p className="text-base font-extrabold text-neutral-900 dark:text-white">
                {formatINR(totalAmount)}
              </p>
              <p className="text-xs text-neutral-500">
                {splitAmounts.length} payments
              </p>
            </div>
          </div>
        </div>

        {/* List of Payments */}
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {splitAmounts.map((amt, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 text-xs border border-neutral-200 dark:border-neutral-800"
            >
              <span className="font-medium text-neutral-600 dark:text-neutral-400">
                Payment {idx + 1}
              </span>
              <span className="font-bold text-neutral-900 dark:text-white font-mono">
                {formatINR(amt)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-3">
          Always check receiver name on your UPI app before entering your PIN.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            disabled={isGenerating}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            Back
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={onConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition shadow-xs"
          >
            {isGenerating ? (
              <span>Generating QRs...</span>
            ) : (
              <>
                <span>Generate QRs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
