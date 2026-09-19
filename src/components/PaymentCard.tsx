import React, { useState } from 'react';
import { Download, Share2, ExternalLink, Check, Clock } from 'lucide-react';
import { SplitPayment, UPIPayment } from '../types/upi';
import { formatINR } from '../utils/currency';
import { downloadPaymentQR, sharePaymentQR } from '../lib/imageExporter';

interface PaymentCardProps {
  payment: SplitPayment;
  originalPayment: UPIPayment;
  totalPaymentsCount: number;
  onStatusChange: (id: string, newStatus: 'pending' | 'opened' | 'completed') => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  originalPayment,
  totalPaymentsCount,
  onStatusChange,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePay = () => {
    window.location.href = payment.uri;
    onStatusChange(payment.id, 'opened');
    showToast('UPI app opening. Verify and complete payment.');
  };

  const handleSave = async () => {
    setDownloading(true);
    try {
      await downloadPaymentQR(payment, originalPayment, false);
      showToast('QR code saved');
    } catch {
      showToast('Could not save QR');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await sharePaymentQR(payment, originalPayment);
      if (res.fallbackUsed) {
        showToast('QR code saved');
      }
    } finally {
      setSharing(false);
    }
  };

  const recipientName = originalPayment.pn || 'UPI Receiver';
  const isCompleted = payment.status === 'completed';

  // Toggle status directly between Pending and Completed
  const handleToggleStatus = () => {
    const nextStatus = isCompleted ? 'pending' : 'completed';
    onStatusChange(payment.id, nextStatus);
    showToast(nextStatus === 'completed' ? 'Marked as Completed ✓' : 'Marked as Pending ⏳');
  };

  return (
    <div
      className={`relative rounded-2xl p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between ${
        isCompleted
          ? 'bg-neutral-50/80 dark:bg-neutral-900/60 border-neutral-300 dark:border-neutral-700'
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs'
      }`}
    >
      <div>
        {/* Top Header with Toggleable Status Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 gap-2">
          <span className="text-xs font-bold text-neutral-900 dark:text-white">
            Part {payment.index} of {totalPaymentsCount}
          </span>

          {/* Toggleable Status Badge (Pending / Completed) */}
          <button
            type="button"
            role="button"
            aria-pressed={isCompleted}
            onClick={handleToggleStatus}
            id={`status-badge-toggle-${payment.index}`}
            title={`Status is ${isCompleted ? 'Completed' : 'Pending'}. Click to toggle.`}
            className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight transition cursor-pointer select-none border ${
              isCompleted
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs hover:opacity-90'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-neutral-500 group-hover:text-black dark:group-hover:text-white" />
                <span>Pending</span>
              </>
            )}
          </button>
        </div>

        {/* QR Code Box */}
        <div className="my-4 flex flex-col items-center">
          <div className="relative p-3.5 bg-white rounded-xl border border-neutral-200 shadow-xs">
            {payment.qrSvg ? (
              <div
                className="w-44 h-44 sm:w-48 sm:h-48"
                dangerouslySetInnerHTML={{ __html: payment.qrSvg }}
              />
            ) : payment.qrDataUrl ? (
              <img
                src={payment.qrDataUrl}
                alt={`QR for payment ${payment.index}`}
                className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
              />
            ) : (
              <div className="w-44 h-44 bg-neutral-100 animate-pulse rounded-lg" />
            )}

            {/* Paid Watermark Overlay when marked Completed */}
            {isCompleted && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-1 shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-black">
                  Completed
                </span>
              </div>
            )}
          </div>

          {/* Amount Display */}
          <div className="mt-3.5 text-center">
            <div className={`text-3xl font-extrabold tracking-tight transition ${
              isCompleted ? 'text-neutral-500 dark:text-neutral-400 line-through' : 'text-neutral-900 dark:text-white'
            }`}>
              {formatINR(payment.amount)}
            </div>
            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 truncate max-w-[220px]">
              {recipientName}
            </p>
            <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate max-w-[220px]">
              {originalPayment.pa}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        {/* Primary Pay Button */}
        <button
          type="button"
          onClick={handlePay}
          id={`btn-pay-${payment.index}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Pay via UPI App</span>
        </button>

        {/* Secondary: Save & Share */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={downloading}
            onClick={handleSave}
            id={`btn-save-${payment.index}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:border-black dark:hover:border-white transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Saving...' : 'Save QR'}</span>
          </button>

          <button
            type="button"
            disabled={sharing}
            onClick={handleShare}
            id={`btn-share-${payment.index}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:border-black dark:hover:border-white transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute inset-x-3 bottom-3 z-20 p-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[11px] font-medium text-center shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
