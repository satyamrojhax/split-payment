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
  const showInstall = !isInstalled && isInstallable;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 pb-[env(safe-area-inset-bottom,0px)] transition-colors no-print w-full max-w-full overflow-hidden"
      aria-label="Mobile Navigation"
      id="bottom-navigation-bar"
    >
      <div
        className={`grid ${
          showInstall ? 'grid-cols-5' : 'grid-cols-4'
        } h-16 max-w-md mx-auto items-center px-1`}
      >
        {/* Tab 1: Split */}
        <button
          type="button"
          onClick={() => onSelectTab('split')}
          id="nav-tab-split"
          className={`flex flex-col items-center justify-center h-full min-h-[44px] px-1 transition-colors cursor-pointer select-none min-w-0 ${
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
          <span className="text-[11px] mt-1 tracking-tight truncate max-w-full">Split</span>
        </button>

        {/* Tab 2: History */}
        <button
          type="button"
          onClick={() => onSelectTab('history')}
          id="nav-tab-history"
          className={`flex flex-col items-center justify-center h-full min-h-[44px] px-1 transition-colors cursor-pointer select-none min-w-0 ${
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
          <span className="text-[11px] mt-1 tracking-tight truncate max-w-full">History</span>
        </button>

        {/* Tab 3: New Split Action */}
        <button
          type="button"
          onClick={onNewSplit}
          id="nav-action-new-split"
          className="flex flex-col items-center justify-center h-full min-h-[44px] px-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer select-none min-w-0"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] mt-1 tracking-tight truncate max-w-full">New</span>
        </button>

        {/* Tab 4: Theme Toggle */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          id="nav-action-theme-toggle"
          aria-label={darkMode ? 'Light Theme' : 'Dark Theme'}
          className="flex flex-col items-center justify-center h-full min-h-[44px] px-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer select-none min-w-0"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 stroke-[2.2]" />
          ) : (
            <Moon className="w-5 h-5 stroke-[2.2]" />
          )}
          <span className="text-[11px] mt-1 tracking-tight truncate max-w-full">
            {darkMode ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* Tab 5: Optional Install Action */}
        {showInstall && (
          <button
            type="button"
            onClick={install}
            id="nav-action-pwa-install"
            className="flex flex-col items-center justify-center h-full min-h-[44px] px-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer select-none min-w-0"
          >
            <Download className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] mt-1 tracking-tight truncate max-w-full">Install</span>
          </button>
        )}
      </div>
    </nav>
  );
};
