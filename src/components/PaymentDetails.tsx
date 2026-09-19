import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Plus, Trash2, ShieldAlert, Sparkles, Scale, Sliders, Layers } from 'lucide-react';
import { UPIPayment, SplitStrategy } from '../types/upi';
import { formatINR } from '../utils/currency';
import { calculateSplit, SplitResult } from '../lib/splitEngine';

interface PaymentDetailsProps {
  originalPayment: UPIPayment;
  initialAmount?: number;
  onProceed: (config: {
    totalAmount: number;
    strategy: SplitStrategy;
    maxAmount: number;
    equalParts: number;
    customAmounts: number[];
    preserveReference: boolean;
  }) => void;
  onBack: () => void;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  originalPayment,
  initialAmount,
  onProceed,
  onBack,
}) => {
  const [totalAmount, setTotalAmount] = useState<number>(
    originalPayment.am || initialAmount || 7000
  );
  const [amountInputStr, setAmountInputStr] = useState<string>(
    (originalPayment.am || initialAmount || 7000).toString()
  );

  const [strategy, setStrategy] = useState<SplitStrategy>('balanced');
  const [maxAmount, setMaxAmount] = useState<number>(1999);
  const [equalParts, setEqualParts] = useState<number>(4);
  const [customAmounts, setCustomAmounts] = useState<number[]>([2000, 1500, 2000, 1500]);
  const [preserveReference, setPreserveReference] = useState<boolean>(false);

  const [splitResult, setSplitResult] = useState<SplitResult>({
    amountsPaise: [],
    amountsRupees: [],
    totalPaise: 0,
    totalRupees: 0,
    isValid: false,
  });

  useEffect(() => {
    const result = calculateSplit(totalAmount, strategy, {
      maxAmountRupees: maxAmount,
      equalPartsCount: equalParts,
      customAmountsRupees: customAmounts,
    });
    setSplitResult(result);
  }, [totalAmount, strategy, maxAmount, equalParts, customAmounts]);

  const handleAmountChange = (valStr: string) => {
    setAmountInputStr(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed > 0) {
      setTotalAmount(parsed);
    }
  };

  const handleAddCustomRow = () => {
    const currentSum = customAmounts.reduce((a, b) => a + b, 0);
    const remainder = Math.max(0, totalAmount - currentSum);
    setCustomAmounts([...customAmounts, remainder || 500]);
  };

  const handleCustomRowChange = (index: number, val: number) => {
    const next = [...customAmounts];
    next[index] = Math.max(0, val);
    setCustomAmounts(next);
  };

  const handleRemoveCustomRow = (index: number) => {
    if (customAmounts.length <= 1) return;
    setCustomAmounts(customAmounts.filter((_, i) => i !== index));
  };

  const handleDistributeEvenly = () => {
    if (customAmounts.length === 0) return;
    const count = customAmounts.length;
    const base = Math.floor(totalAmount / count);
    const remainder = totalAmount % count;
    const next = Array.from({ length: count }, (_, i) => (i < remainder ? base + 1 : base));
    setCustomAmounts(next);
  };

  const canContinue = splitResult.isValid && splitResult.amountsRupees.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-left">
      {/* Top Receiver Summary Card */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <span className="text-[11px] uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider">
              Paying To
            </span>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight mt-0.5">
              {originalPayment.pn || 'UPI Receiver'}
            </h3>
            <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-0.5">
              {originalPayment.pa}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider block">
              Total Amount
            </span>
            <div className="flex items-center sm:justify-end gap-1 mt-0.5">
              <span className="text-xl font-bold text-neutral-900 dark:text-white">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                value={amountInputStr}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-28 sm:w-32 px-2.5 py-1 text-xl font-extrabold text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>
        </div>

        {/* Strategy Selector */}
        <div className="mt-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-2.5">
            Select Split Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            {/* Balanced Split */}
            <button
              type="button"
              onClick={() => setStrategy('balanced')}
              className={`p-3 rounded-xl text-left transition border ${
                strategy === 'balanced'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Scale className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Balanced</span>
              </div>
              <p className={`text-[10px] leading-tight ${strategy === 'balanced' ? 'opacity-80' : 'text-neutral-500 dark:text-neutral-400'}`}>
                Equal parts under limit
              </p>
            </button>

            {/* Max Limit */}
            <button
              type="button"
              onClick={() => setStrategy('max_amount')}
              className={`p-3 rounded-xl text-left transition border ${
                strategy === 'max_amount'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Max Limit</span>
              </div>
              <p className={`text-[10px] leading-tight ${strategy === 'max_amount' ? 'opacity-80' : 'text-neutral-500 dark:text-neutral-400'}`}>
                Fill up to ₹1,999 max
              </p>
            </button>

            {/* Equal Split */}
            <button
              type="button"
              onClick={() => setStrategy('equal')}
              className={`p-3 rounded-xl text-left transition border ${
                strategy === 'equal'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Equal</span>
              </div>
              <p className={`text-[10px] leading-tight ${strategy === 'equal' ? 'opacity-80' : 'text-neutral-500 dark:text-neutral-400'}`}>
                Split into N equal parts
              </p>
            </button>

            {/* Custom Split */}
            <button
              type="button"
              onClick={() => setStrategy('custom')}
              className={`p-3 rounded-xl text-left transition border ${
                strategy === 'custom'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Sliders className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Custom</span>
              </div>
              <p className={`text-[10px] leading-tight ${strategy === 'custom' ? 'opacity-80' : 'text-neutral-500 dark:text-neutral-400'}`}>
                Set custom amounts
              </p>
            </button>
          </div>
        </div>

        {/* Strategy Specific Controls */}
        <div className="mt-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
          {(strategy === 'balanced' || strategy === 'max_amount') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-neutral-900 dark:text-white">
                  {strategy === 'balanced' ? 'Upper limit per payment:' : 'Maximum payment amount:'}
                </label>
                <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                  {formatINR(maxAmount)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-neutral-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full pl-7 pr-3 py-1.5 text-sm font-bold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMaxAmount(1999)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 hover:border-neutral-500"
                  >
                    ₹1,999
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaxAmount(1499)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 hover:border-neutral-500"
                  >
                    ₹1,499
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaxAmount(999)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 hover:border-neutral-500"
                  >
                    ₹999
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                {strategy === 'balanced'
                  ? `Splits into equal parts so no payment exceeds ${formatINR(maxAmount)}.`
                  : `Fills payments up to ${formatINR(maxAmount)} with remainder in final payment.`}
              </p>
            </div>
          )}

          {strategy === 'equal' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-neutral-900 dark:text-white">
                  Number of payments
                </label>
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  {equalParts} parts
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={equalParts}
                  onChange={(e) => setEqualParts(parseInt(e.target.value))}
                  className="flex-1 accent-black dark:accent-white"
                />
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={equalParts}
                  onChange={(e) => setEqualParts(Math.max(1, parseInt(e.target.value) || 2))}
                  className="w-14 px-2 py-1 text-center text-sm font-bold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {strategy === 'custom' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-900 dark:text-white">
                  Custom Payments
                </label>
                <button
                  type="button"
                  onClick={handleDistributeEvenly}
                  className="text-[11px] text-neutral-900 dark:text-neutral-100 hover:underline font-semibold"
                >
                  Distribute Evenly
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {customAmounts.map((amt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 w-16 shrink-0">
                      Part {idx + 1}
                    </span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1.5 text-xs text-neutral-400">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={amt}
                        onChange={(e) => handleCustomRowChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-full pl-6 pr-3 py-1 text-xs font-bold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                    {customAmounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomRow(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddCustomRow}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:border-black dark:hover:border-white transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Payment</span>
              </button>
            </div>
          )}
        </div>

        {/* Real-time Preview */}
        <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Split Breakdown ({splitResult.amountsRupees.length} payments)
            </span>
            <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-white">
              Total: {formatINR(totalAmount)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {splitResult.amountsRupees.map((partAmount, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
              >
                <span className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500 block">
                  Payment {idx + 1}
                </span>
                <span className="text-base font-bold text-neutral-900 dark:text-white mt-0.5 block">
                  {formatINR(partAmount)}
                </span>
              </div>
            ))}
          </div>

          {/* Validation Error */}
          {!splitResult.isValid && splitResult.error && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{splitResult.error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:border-black dark:hover:border-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          disabled={!canContinue}
          onClick={() => {
            if (canContinue) {
              onProceed({
                totalAmount,
                strategy,
                maxAmount,
                equalParts,
                customAmounts,
                preserveReference,
              });
            }
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition ${
            canContinue
              ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 cursor-pointer shadow-xs'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
          }`}
        >
          <span>Review Split</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
