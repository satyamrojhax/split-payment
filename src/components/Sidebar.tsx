import React, { useState } from 'react';
import { 
  Layers, 
  Clock, 
  PlusCircle, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Download, 
  Share,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SidebarProps {
  activeView: 'split' | 'history';
  onSelectView: (view: 'split' | 'history') => void;
  onNewSplit: () => void;
  historyCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  privacyMode: boolean;
  onTogglePrivacyMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  onNewSplit,
  historyCount,
  darkMode,
  onToggleDarkMode,
  privacyMode,
  onTogglePrivacyMode,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-5 h-screen sticky top-0 shrink-0 select-none z-30 no-print transition-colors justify-between text-left"
    >
      {/* Top Section: Brand Logo & Main Navigation */}
      <div className="space-y-6">
        {/* Brand */}
        <div
          onClick={onNewSplit}
          className="flex items-center gap-3 cursor-pointer group"
          id="sidebar-brand"
        >
          <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-extrabold text-sm tracking-tighter shadow-xs">
            ₹/
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-black dark:text-white">
                SplitPay
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">
              100% On-Device
            </span>
          </div>
        </div>

        {/* Primary Navigation Buttons: Split & History */}
        <div className="space-y-1.5 pt-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 px-3 mb-2">
            Navigation
          </div>

          {/* Split Navigation Button */}
          <button
            type="button"
            onClick={() => onSelectView('split')}
            id="sidebar-btn-split"
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'split'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 stroke-[2.2]" />
              <span>Split Payment</span>
            </div>
            {activeView === 'split' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />
            )}
          </button>

          {/* History Navigation Button */}
          <button
            type="button"
            onClick={() => onSelectView('history')}
            id="sidebar-btn-history"
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'history'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 stroke-[2.2]" />
              <span>History</span>
            </div>
            {historyCount > 0 && (
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeView === 'history'
                    ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black'
                    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {historyCount}
              </span>
            )}
          </button>

          {/* Action: New Split */}
          <button
            type="button"
            onClick={onNewSplit}
            id="sidebar-btn-new-split"
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white transition cursor-pointer mt-2"
          >
            <PlusCircle className="w-4 h-4 text-neutral-500" />
            <span>Start New Split</span>
          </button>
        </div>

        {/* Privacy & Offline Security Card */}
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
            <span>Local & Private</span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            No server calls, no database uploads. QR codes are compiled purely on your machine.
          </p>
        </div>
      </div>

      {/* Bottom Section: Controls & Attribution */}
      <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        {/* Theme Toggle & PWA install */}
        <div className="flex items-center gap-2">
          {/* Theme Button */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            id="sidebar-theme-toggle"
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold transition cursor-pointer"
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-neutral-100" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-neutral-800" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* PWA Install Button */}
          {!isInstalled && (
            isInstallable ? (
              <button
                type="button"
                onClick={install}
                id="sidebar-pwa-install"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            ) : isIOS ? (
              <button
                type="button"
                onClick={() => setShowIOSGuide(true)}
                id="sidebar-ios-install"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 transition cursor-pointer"
              >
                <Share className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            ) : null
          )}
        </div>

        {/* Required Attribution */}
        <div className="pt-2 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          <div className="font-semibold text-neutral-900 dark:text-neutral-200">
            Designed and Developed By Satyam RojhaX.
          </div>
          <div className="text-[10px] text-neutral-500 dark:text-neutral-500 mt-0.5">
            Brought to you by LFRDCA Technologies
          </div>
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
              3. SplitPay is now installed for offline use!
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
    </aside>
  );
};
