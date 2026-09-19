import React, { useState } from 'react';
import { WifiOff, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  // If online or user dismissed the banner during this session, do not render
  if (isOnline || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black px-4 py-2.5 shadow-md no-print select-none border-b border-neutral-800 dark:border-neutral-200"
        role="status"
        aria-live="polite"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 rounded-md bg-neutral-800 dark:bg-neutral-200 text-amber-400 dark:text-amber-600 shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-bold tracking-tight">Offline Mode</span>
              <span className="text-neutral-400 dark:text-neutral-600 text-[11px] hidden sm:inline">•</span>
              <span className="text-neutral-300 dark:text-neutral-700 text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 dark:text-emerald-600 shrink-0 inline" />
                All split calculations, QR codes, and history run 100% on-device.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-neutral-400 hover:text-white dark:hover:text-black transition cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center shrink-0"
            title="Dismiss notification"
            aria-label="Dismiss offline notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
