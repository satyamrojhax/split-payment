import React from 'react';
import { SplitPayment, UPIPayment } from '../types/upi';
import { formatINR } from '../utils/currency';

interface PrintableSummaryProps {
  originalPayment: UPIPayment;
  payments: SplitPayment[];
  totalAmount: number;
}

export const PrintableSummary: React.FC<PrintableSummaryProps> = ({
  originalPayment,
  payments,
  totalAmount,
}) => {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const timeStr = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      {/* Embedded print-specific CSS layout using @media print queries */}
      <style>{`
        @media print {
          /* Page setup for clean physical paper printing */
          @page {
            size: A4 portrait;
            margin: 12mm 14mm;
          }

          /* Force high-contrast black on white background */
          html, body {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
            line-height: 1.35 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Explicitly hide all UI navigation, sidebars, headers, floating bars, and interactive buttons */
          header,
          nav,
          aside,
          footer,
          #bottom-navigation-bar,
          #desktop-sidebar,
          #header-tab-split,
          #header-tab-history,
          button,
          .no-print,
          [role="dialog"],
          [role="navigation"],
          [aria-label="Mobile Navigation"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Display the printable summary document cleanly */
          #printable-summary-root {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          /* Clean card layout that will not awkwardly break across physical pages */
          .print-qr-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 1.5pt solid #000000 !important;
            border-radius: 6pt !important;
            padding: 10pt !important;
            background: #ffffff !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }

          /* Ensure QR image renders crisp and unblurred */
          .print-qr-img {
            width: 130pt !important;
            height: 130pt !important;
            max-width: 130pt !important;
            max-height: 130pt !important;
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: pixelated !important;
            display: block !important;
            margin: 6pt auto !important;
          }

          .print-grid-layout {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 12pt !important;
            width: 100% !important;
          }

          /* Prevent header break */
          .print-header-block {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>

      {/* Printable Sheet DOM Element (Hidden on screen, Visible on print) */}
      <div
        id="printable-summary-root"
        className="hidden print:block w-full max-w-4xl mx-auto bg-white text-black font-sans"
      >
        {/* Document Header */}
        <div className="print-header-block border-b-2 border-black pb-4 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded border-2 border-black flex items-center justify-center font-extrabold text-base">
                ₹/
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight uppercase">
                  SplitPay
                </h1>
                <p className="text-[10px] text-gray-700 tracking-wide font-semibold">
                  UPI Split Payment Voucher & QR Sheet
                </p>
              </div>
            </div>

            <div className="text-right text-[10px] text-gray-800">
              <p className="font-bold">Printed: {dateStr} at {timeStr}</p>
              <p className="text-gray-600">Generated On-Device • Client-Side</p>
            </div>
          </div>

          {/* Recipient & Payment Breakdown Bar */}
          <div className="mt-4 pt-3 border-t border-gray-400 grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-600 block">
                Payee / Beneficiary
              </span>
              <span className="font-extrabold text-sm text-black">
                {originalPayment.pn || 'UPI Receiver'}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-600 block">
                UPI ID (VPA)
              </span>
              <span className="font-mono text-xs text-black font-bold">
                {originalPayment.pa}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-gray-600 block">
                Total Amount ({payments.length} parts)
              </span>
              <span className="font-black text-base text-black">
                {formatINR(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid of Printable QR Code Cards */}
        <div className="print-grid-layout grid grid-cols-2 gap-4">
          {payments.map((p) => (
            <div key={p.id} className="print-qr-card border-2 border-black rounded-lg p-3">
              {/* Part Index & Status */}
              <div className="w-full flex items-center justify-between pb-1 mb-2 border-b border-gray-300 text-[10px] font-bold uppercase">
                <span className="text-gray-800">
                  Part {p.index} of {payments.length}
                </span>
                <span className="text-black font-mono">
                  {p.status === 'completed' ? '[ ✓ COMPLETED ]' : '[ PENDING ]'}
                </span>
              </div>

              {/* Amount */}
              <div className="text-xl font-black text-black tracking-tight my-1">
                {formatINR(p.amount)}
              </div>

              {/* QR Image Box */}
              <div className="my-2 p-1.5 border border-black rounded bg-white">
                {p.qrDataUrl ? (
                  <img
                    src={p.qrDataUrl}
                    alt={`UPI QR Part ${p.index}`}
                    className="print-qr-img w-36 h-36 object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 border border-dashed border-gray-400 flex items-center justify-center text-xs">
                    Scan with UPI app
                  </div>
                )}
              </div>

              {/* Recipient Details */}
              <div className="text-[11px] font-bold text-black mt-1">
                {originalPayment.pn || 'UPI Merchant'}
              </div>
              <div className="text-[10px] font-mono text-gray-700">
                {originalPayment.pa}
              </div>

              {p.referenceId && (
                <div className="text-[9px] font-mono text-gray-500 mt-1">
                  Ref: {p.referenceId}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Paper Footer with Attribution */}
        <div className="mt-6 pt-3 border-t-2 border-black text-center space-y-1">
          <div className="text-[10px] text-gray-800 font-semibold">
            Designed & Developed By Satyam RojhaX
          </div>
          <p className="text-[9px] text-gray-600 leading-tight">
            SplitPay is an on-device utility. Payments are executed directly via your authorized UPI app. Verify all payee details before entering your UPI PIN.
          </p>
        </div>
      </div>
    </>
  );
};
