import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const RegulatoryDisclaimer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto my-5 no-print text-left">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer min-h-[44px]"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span>Safety Notice & Compliance Information</span>
          </div>
          <span className="text-neutral-400">
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {isOpen && (
          <div className="px-4 pb-4 pt-1 text-xs text-neutral-500 dark:text-neutral-400 space-y-2 border-t border-neutral-200 dark:border-neutral-800">
            <p>
              <strong className="text-neutral-900 dark:text-white">SplitPay is an on-device utility</strong>. It does not process or hold money. All payments are approved and executed directly by you inside your official UPI app.
            </p>
            <p>
              <strong className="text-neutral-900 dark:text-white">Zero Fees & Full Privacy:</strong> Standard bank-to-bank UPI is free under NPCI rules. Everything here happens offline on your own device with zero servers involved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 py-6 text-center no-print mt-12 bg-white dark:bg-black transition-colors">
      <div className="max-w-4xl mx-auto px-4 space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
          <span>SplitPay</span>
          <span>•</span>
          <span className="text-neutral-500 dark:text-neutral-400 font-normal">
            Private, on-device UPI payment splitter
          </span>
        </div>

        {/* Required Attribution */}
        <div className="pt-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
          <p className="font-bold text-neutral-900 dark:text-white">
            Designed & Developed By Satyam RojhaX
          </p>
        </div>

        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 pt-1">
          Compatible with PhonePe, Google Pay, Paytm, BHIM, and all NPCI-compliant UPI applications.
        </p>
      </div>
    </footer>
  );
};
