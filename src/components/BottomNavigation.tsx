import React from 'react';
import { Layers, Clock, PlusCircle, Sun, Moon, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface BottomNavigationProps {
  currentTab: 'split' | 'history';
  onSelectTab: (tab: 'split' | 'history') => void;
  onNewSplit: () => void;
  historyCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  onNewSplit,
  historyCount,
  darkMode,
  onToggleDarkMode,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 pb-[env(safe-area-inset-bottom,0px)] transition-colors no-print"
      aria-label="Mobile Navigation"
      id="bottom-navigation-bar"
    >
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto items-center px-2">
        {/* Tab 1: Split */}
        <button
          type="button"
          onClick={() => onSelectTab('split')}
          id="nav-tab-split"
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer select-none ${
            currentTab === 'split'
              ? 'text-black dark:text-white font-bold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Layers className="w-5 h-5 stroke-[2.2]" />
            {currentTab === 'split' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black dark:bg-white" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Split</span>
        </button>

        {/* Tab 2: History */}
        <button
          type="button"
          onClick={() => onSelectTab('history')}
          id="nav-tab-history"
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer select-none ${
            currentTab === 'history'
              ? 'text-black dark:text-white font-bold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Clock className="w-5 h-5 stroke-[2.2]" />
            {historyCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-[9px] font-extrabold flex items-center justify-center">
                {historyCount}
              </span>
            )}
            {currentTab === 'history' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black dark:bg-white" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">History</span>
        </button>

        {/* Tab 3: New Split Action */}
        <button
          type="button"
          onClick={onNewSplit}
          id="nav-action-new-split"
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer select-none"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] mt-1 tracking-tight">New</span>
        </button>

        {/* Tab 4: Theme / PWA Install */}
        {!isInstalled && isInstallable ? (
          <button
            type="button"
            onClick={install}
            id="nav-action-pwa-install"
            className="flex flex-col items-center justify-center h-full min-h-[44px] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer select-none"
          >
            <Download className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] mt-1 tracking-tight">Install</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleDarkMode}
            id="nav-action-theme-toggle"
            aria-label={darkMode ? 'Light Theme' : 'Dark Theme'}
            className="flex flex-col items-center justify-center h-full min-h-[44px] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer select-none"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <Moon className="w-5 h-5 stroke-[2.2]" />
            )}
            <span className="text-[11px] mt-1 tracking-tight">
              {darkMode ? 'Light' : 'Dark'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
