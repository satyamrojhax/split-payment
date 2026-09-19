import React, { useState } from 'react';
import { X, AlertCircle, ArrowRight } from 'lucide-react';
import { parseUPIUri } from '../lib/upiParser';
import { UPIPayment } from '../types/upi';

interface PasteUPIModalProps {
  onSuccess: (payment: UPIPayment, hasAmount: boolean) => void;
  onClose: () => void;
}

export const PasteUPIModal: React.FC<PasteUPIModalProps> = ({ onSuccess, onClose }) => {
  const [upiLink, setUpiLink] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleParse = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    const trimmed = upiLink.trim();
    if (!trimmed) {
      setError('Please paste a UPI link.');
      return;
    }

    const result = parseUPIUri(trimmed);
    if (!result.success || !result.payment) {
      setError(result.error || 'Invalid UPI link format. Must start with upi://pay');
      return;
    }

    onSuccess(result.payment, result.hasAmount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 text-left">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">Paste UPI Link</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Enter a standard upi://pay link</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleParse} className="mt-4 space-y-3.5">
          <div>
            <textarea
              rows={3}
              value={upiLink}
              onChange={(e) => {
                setUpiLink(e.target.value);
                if (error) setError(null);
              }}
              placeholder="upi://pay?pa=store@upi&am=7000&pn=Store"
              className="w-full px-3 py-2.5 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
