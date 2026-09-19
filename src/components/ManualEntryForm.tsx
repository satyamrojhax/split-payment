import React, { useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { UPIPayment } from '../types/upi';
import { isValidUPIId } from '../utils/validation';

interface ManualEntryFormProps {
  onSuccess: (payment: UPIPayment, hasAmount: boolean) => void;
}

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSuccess }) => {
  const [upiInput, setUpiInput] = useState('');
  const [amountInput, setAmountInput] = useState('7000');
  const [nameInput, setNameInput] = useState('');
  const [selectedHandle, setSelectedHandle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const commonHandles = ['@upi', '@okaxis', '@paytm', '@ybl', '@okhdfcbank'];

  // Handle phone or raw input
  const cleanUpiInput = upiInput.trim();

  // Helper to format input into valid UPI ID
  const getResolvedUPI = (): string => {
    const raw = cleanUpiInput;
    if (!raw) return '';

    // If it contains @, it's already a full UPI ID
    if (raw.includes('@')) {
      return raw.toLowerCase();
    }

    // Check if it is a 10-digit phone number or UPI number
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      const handle = selectedHandle || '@upi';
      return `${digitsOnly}${handle}`;
    }

    // If user typed a username without @ and picked a handle
    if (selectedHandle) {
      return `${raw}${selectedHandle}`;
    }

    // Default fallback
    return `${raw}@upi`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const resolvedUPI = getResolvedUPI();

    if (!resolvedUPI) {
      setError('Please enter a UPI ID or 10-digit phone number.');
      return;
    }

    if (!isValidUPIId(resolvedUPI)) {
      setError(`"${resolvedUPI}" is not a valid UPI format. Use name@bank or 10-digit number.`);
      return;
    }

    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    if (parsedAmount > 1000000) {
      setError('Maximum amount supported is ₹10,00,000.');
      return;
    }

    const payeeName = nameInput.trim() || undefined;

    // Construct valid UPI payment structure
    const rawParams: Record<string, string> = {
      pa: resolvedUPI,
      am: parsedAmount.toFixed(2),
      cu: 'INR',
    };
    if (payeeName) {
      rawParams.pn = payeeName;
    }

    const uri = `upi://pay?pa=${encodeURIComponent(resolvedUPI)}${
      payeeName ? `&pn=${encodeURIComponent(payeeName)}` : ''
    }&am=${parsedAmount.toFixed(2)}&cu=INR`;

    const payment: UPIPayment = {
      pa: resolvedUPI,
      pn: payeeName,
      am: parsedAmount,
      cu: 'INR',
      originalUri: uri,
      rawParams,
    };

    onSuccess(payment, true);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-4 text-left">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
        
        {/* Field 1: UPI ID or Phone */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              UPI ID or Mobile Number
            </label>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Required
            </span>
          </div>
          <input
            type="text"
            value={upiInput}
            onChange={(e) => {
              setUpiInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. 9876543210 or store@okhdfcbank"
            className="w-full px-3.5 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-sm font-medium focus:outline-none focus:border-black dark:focus:border-white transition min-h-[44px]"
          />

          {/* Quick Handle Selection if user types a number or prefix */}
          {!upiInput.includes('@') && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mr-1">
                Handle:
              </span>
              {commonHandles.map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setSelectedHandle(selectedHandle === h ? '' : h)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border min-h-[30px] flex items-center justify-center cursor-pointer ${
                    selectedHandle === h
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Field 2: Total Amount */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Total Amount to Split (₹)
            </label>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              INR
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-neutral-400 dark:text-neutral-500">
              ₹
            </span>
            <input
              type="number"
              min="1"
              step="any"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="7000"
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-lg font-bold focus:outline-none focus:border-black dark:focus:border-white transition min-h-[44px]"
            />
          </div>
        </div>

        {/* Field 3: Receiver Name (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Receiver Name (Optional)
            </label>
            <span className="text-[11px] text-neutral-400">
              Optional
            </span>
          </div>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Shop Name or Friend"
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-sm focus:outline-none focus:border-black dark:focus:border-white transition min-h-[44px]"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 flex items-center gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          id="btn-manual-split-proceed"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 transition shadow-xs cursor-pointer min-h-[48px]"
        >
          <span>Continue to Split →</span>
        </button>
      </div>
    </form>
  );
};
