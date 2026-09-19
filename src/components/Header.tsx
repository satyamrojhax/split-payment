import React, { useState } from 'react';
import { Sun, Moon, ShieldCheck, Download, RefreshCw, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  privacyMode: boolean;
  onTogglePrivacyMode: () => void;
  onReset: () => void;
  hasActiveSession: boolean;
  activeView: 'split' | 'history';
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  privacyMode,
  onTogglePrivacyMode,
  onReset,
  hasActiveSession,
  activeView,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <header className="w-full bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-20 no-print transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Brand & Desktop Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile Brand (Shown on mobile when sidebar is hidden) */}
          <div 
            onClick={onReset}
            className="flex md:hidden items-center gap-2 cursor-pointer select-none group"
            id="splitpay-brand-header"
          >
            <div className="w-7 h-7 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-extrabold text-xs tracking-tighter">
              ₹/
            </div>
            <span className="font-extrabold text-base tracking-tight text-black dark:text-white">
              SplitPay
            </span>
          </div>

          {/* Desktop Status Indicator / Section Title */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
              {activeView === 'split' ? 'Payment Splitter' : 'Saved Splits History'}
            </span>
            <span>•</span>
            <span className="text-[11px] text-neutral-500 font-normal">
              Private On-Device Engine
            </span>
          </div>
        </div>

        {/* Right Actions: Privacy, Dark Mode, New Split */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Privacy Badge */}
          <button
            type="button"
            onClick={onTogglePrivacyMode}
            id="btn-toggle-privacy-mode"
            title="Privacy Mode: Everything runs locally on device"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              privacyMode
                ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700'
                : 'bg-transparent text-neutral-500 border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">100% On-Device</span>
            <span className="sm:hidden">Private</span>
          </button>

          {/* Dark Mode Toggle (Especially useful on mobile) */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            id="btn-toggle-dark-mode"
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition cursor-pointer md:hidden"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-neutral-100" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-800" />
            )}
          </button>

          {/* Mobile Install button */}
          {!isInstalled && (
            isInstallable ? (
              <button
                type="button"
                onClick={install}
                id="btn-header-install"
                className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 transition cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Install</span>
              </button>
            ) : isIOS ? (
              <button
                type="button"
                onClick={() => setShowIOSGuide(true)}
                id="btn-header-ios-install"
                className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 transition cursor-pointer"
              >
                <Share className="w-3 h-3" />
                <span>Install</span>
              </button>
            ) : null
          )}

          {/* Reset / New Split Button */}
          {hasActiveSession && (
            <button
              type="button"
              onClick={onReset}
              id="btn-reset-workflow"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition cursor-pointer shadow-xs"
              title="Start New Split"
            >
              <RefreshCw className="w-3 h-3" />
              <span>New Split</span>
            </button>
          )}
        </div>
      </div>

      {/* iOS Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-left">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Install on iPhone or iPad
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              1. Tap the <strong>Share</strong> button in the Safari toolbar.<br />
              2. Tap <strong>Add to Home Screen</strong>.<br />
              3. SplitPay is now ready for offline use!
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-black dark:bg-white py-2.5 text-xs font-bold text-white dark:text-black transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
