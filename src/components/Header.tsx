import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode?: () => void;
  privacyMode?: boolean;
  onTogglePrivacyMode?: () => void;
  onReset?: () => void;
  hasActiveSession?: boolean;
  activeView: 'split' | 'history';
}

export const Header: React.FC<HeaderProps> = ({ activeView }) => {
  return (
    <header className="w-full bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-20 no-print transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 select-none" id="splitpay-brand-header">
            <div className="w-7 h-7 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-extrabold text-xs tracking-tighter shadow-xs">
              ₹/
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-black dark:text-white">
                SplitPay
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 hidden xs:inline">
                • {activeView === 'split' ? 'Splitter' : 'History'}
              </span>
            </div>
          </div>

          {/* Desktop Status Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 border-l border-neutral-200 dark:border-neutral-800 pl-3">
            <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
              {activeView === 'split' ? 'UPI Payment Splitter' : 'Saved Splits History'}
            </span>
          </div>
        </div>

        {/* Right Status: Clean, Non-Interactive Informational Badge (Zero buttons in header) */}
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 select-none"
            title="All computations and QR generation happen completely on your device. Zero data sent to servers."
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">100% On-Device</span>
            <span className="sm:hidden">On-Device</span>
          </div>
        </div>
      </div>
    </header>
  );
};
