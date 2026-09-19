import React from 'react';
import { Lock, ShieldCheck, HardDrive, EyeOff } from 'lucide-react';

export const TrustIndicators: React.FC = () => {
  const items = [
    {
      icon: Lock,
      title: '100% On-Device',
      desc: 'Runs entirely in your browser',
    },
    {
      icon: HardDrive,
      title: 'No Cloud Upload',
      desc: 'QR images never leave your phone',
    },
    {
      icon: EyeOff,
      title: 'Zero Storage',
      desc: 'No history, accounts, or cookies',
    },
    {
      icon: ShieldCheck,
      title: 'Safe & Direct',
      desc: 'You pay directly in your UPI app',
    },
  ];

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left"
          >
            <Icon className="w-4 h-4 text-neutral-800 dark:text-neutral-200 mb-1.5" />
            <p className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
              {item.title}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
              {item.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export const PrivacyCallout: React.FC = () => {
  return (
    <div className="w-full rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3.5 flex items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400 text-left">
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-neutral-900 dark:text-white shrink-0" />
        <span>Your payment details are never saved or sent to any server.</span>
      </div>
      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shrink-0">
        Private
      </span>
    </div>
  );
};
