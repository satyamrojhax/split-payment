import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNavigation } from './components/BottomNavigation';
import { HistoryPage } from './components/HistoryPage';
import { TrustIndicators, PrivacyCallout } from './components/TrustIndicators';
import { WorkflowProgress, WorkflowStep } from './components/WorkflowProgress';
import { ManualEntryForm } from './components/ManualEntryForm';
import { QRUploader } from './components/QRUploader';
import { QRScanner } from './components/QRScanner';
import { PasteUPIModal } from './components/PasteUPIModal';
import { PaymentDetails } from './components/PaymentDetails';
import { UserConfirmationModal } from './components/UserConfirmationModal';
import { SplitResultsView } from './components/SplitResultsView';
import { PrintableSummary } from './components/PrintableSummary';
import { RegulatoryDisclaimer, Footer } from './components/RegulatoryDisclaimer';
import { UPIPayment, SplitPayment, SplitStrategy } from './types/upi';
import { HistoryRecord } from './types/history';
import { calculateSplit } from './lib/splitEngine';
import { parseUPIUri } from './lib/upiParser';
import { buildSplitUPIUri } from './lib/upiBuilder';
import { generatePaymentQR } from './lib/qrGenerator';
import { toPaise } from './utils/currency';
import {
  getHistoryRecords,
  saveHistoryRecord,
  updateRecordPayments,
  deleteHistoryRecord,
  clearAllHistory,
} from './utils/historyStorage';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { WifiOff, Edit3, QrCode } from 'lucide-react';

export default function App() {
  const isOnline = useOnlineStatus();

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('splitpay_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('splitpay_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('splitpay_theme', 'light');
    }
  }, [darkMode]);

  // Main View Mode: Split Workflow vs History Page
  const [activeView, setActiveView] = useState<'split' | 'history'>('split');

  // History Records from Local Storage
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(() =>
    getHistoryRecords()
  );
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);

  // Workflow Step
  const [step, setStep] = useState<WorkflowStep>('upload');
  const [inputTab, setInputTab] = useState<'manual' | 'qr'>('manual');
  const [originalPayment, setOriginalPayment] = useState<UPIPayment | null>(null);
  const [, setHasOriginalAmount] = useState<boolean>(false);

  // Configuration State
  const [totalAmount, setTotalAmount] = useState<number>(7000);
  const [strategy, setStrategy] = useState<SplitStrategy>('balanced');
  const [maxAmount, setMaxAmount] = useState<number>(1999);
  const [equalParts, setEqualParts] = useState<number>(4);
  const [customAmounts, setCustomAmounts] = useState<number[]>([2000, 1500, 2000, 1500]);
  const [preserveReference, setPreserveReference] = useState<boolean>(false);

  // Pending Review Amounts
  const [pendingSplitAmounts, setPendingSplitAmounts] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isGeneratingQRs, setIsGeneratingQRs] = useState<boolean>(false);

  // Output Generated Payments
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);

  // Modals
  const [showScanner, setShowScanner] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);

  // Handle entry parsed (either from manual form or QR upload)
  const handlePaymentParsed = (payment: UPIPayment, hasAmount: boolean) => {
    setOriginalPayment(payment);
    setHasOriginalAmount(hasAmount);
    if (hasAmount && payment.am) {
      setTotalAmount(payment.am);
    }
    setShowScanner(false);
    setShowPasteModal(false);
    setStep('configure');
    setActiveView('split');
  };

  // Trigger Confirmation Review
  const handleProceedToReview = (config: {
    totalAmount: number;
    strategy: SplitStrategy;
    maxAmount: number;
    equalParts: number;
    customAmounts: number[];
    preserveReference: boolean;
  }) => {
    setTotalAmount(config.totalAmount);
    setStrategy(config.strategy);
    setMaxAmount(config.maxAmount);
    setEqualParts(config.equalParts);
    setCustomAmounts(config.customAmounts);
    setPreserveReference(config.preserveReference);

    const calc = calculateSplit(config.totalAmount, config.strategy, {
      maxAmountRupees: config.maxAmount,
      equalPartsCount: config.equalParts,
      customAmountsRupees: config.customAmounts,
    });

    if (calc.isValid && calc.amountsRupees.length > 0) {
      setPendingSplitAmounts(calc.amountsRupees);
      setShowConfirmModal(true);
    }
  };

  // Confirmed -> Generate all QRs on device & Persist to History
  const handleConfirmAndGenerate = async () => {
    if (!originalPayment) return;
    setIsGeneratingQRs(true);

    try {
      const generatedList: SplitPayment[] = [];
      const totalParts = pendingSplitAmounts.length;

      for (let i = 0; i < totalParts; i++) {
        const amt = pendingSplitAmounts[i];
        const partIndex = i + 1;

        const { uri, referenceId } = buildSplitUPIUri(originalPayment, {
          amount: amt,
          partIndex,
          totalParts,
          preserveReference,
        });

        const { dataUrl, svgString } = await generatePaymentQR(uri);

        generatedList.push({
          id: `split-${partIndex}-${Date.now()}`,
          index: partIndex,
          amount: amt,
          amountPaise: toPaise(amt),
          uri,
          referenceId,
          qrDataUrl: dataUrl,
          qrSvg: svgString,
          status: 'pending',
        });
      }

      setSplitPayments(generatedList);
      setShowConfirmModal(false);
      setStep('results');

      // Automatically persist to offline History
      const recordId = `rec-${Date.now()}`;
      const newRecord: HistoryRecord = {
        id: recordId,
        createdAt: new Date().toISOString(),
        payeeName: originalPayment.pn || 'UPI Receiver',
        payeeVPA: originalPayment.pa,
        totalAmount,
        strategy,
        splitPayments: generatedList,
        originalPayment,
      };
      saveHistoryRecord(newRecord);
      setHistoryRecords(getHistoryRecords());
      setCurrentRecordId(recordId);
    } catch (err) {
      console.error('Error generating QRs:', err);
    } finally {
      setIsGeneratingQRs(false);
    }
  };

  // Status Change for payment tracking
  const handleStatusChange = (
    id: string,
    newStatus: 'pending' | 'opened' | 'completed'
  ) => {
    const updated = splitPayments.map((p) =>
      p.id === id ? { ...p, status: newStatus } : p
    );
    setSplitPayments(updated);

    // Sync status change to history in localStorage
    if (currentRecordId) {
      updateRecordPayments(currentRecordId, updated);
      setHistoryRecords(getHistoryRecords());
    }
  };

  // Resume a past split from the History page
  const handleResumeSplit = (record: HistoryRecord) => {
    setOriginalPayment(record.originalPayment);
    setTotalAmount(record.totalAmount);
    setStrategy(record.strategy);
    setSplitPayments(record.splitPayments);
    setCurrentRecordId(record.id);
    setStep('results');
    setActiveView('split');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete a history record
  const handleDeleteRecord = (id: string) => {
    deleteHistoryRecord(id);
    setHistoryRecords(getHistoryRecords());
    if (currentRecordId === id) {
      setCurrentRecordId(null);
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistoryRecords([]);
    setCurrentRecordId(null);
  };

  // Toggle status directly from the history item
  const handleToggleStatusInHistory = (recordId: string, paymentId: string) => {
    const rec = historyRecords.find((r) => r.id === recordId);
    if (!rec) return;
    const updated = rec.splitPayments.map((p) => {
      if (p.id === paymentId) {
        const nextStatus = p.status === 'completed' ? 'pending' : 'completed';
        return { ...p, status: nextStatus as 'pending' | 'completed' };
      }
      return p;
    });
    updateRecordPayments(recordId, updated);
    setHistoryRecords(getHistoryRecords());
    if (currentRecordId === recordId) {
      setSplitPayments(updated);
    }
  };

  // Reset all state to begin a new split
  const handleReset = () => {
    setOriginalPayment(null);
    setHasOriginalAmount(false);
    setSplitPayments([]);
    setPendingSplitAmounts([]);
    setShowConfirmModal(false);
    setShowScanner(false);
    setShowPasteModal(false);
    setCurrentRecordId(null);
    setStep('upload');
    setActiveView('split');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans flex flex-row transition-colors selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Sidebar: Houses Split & History Navigation on the side */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        onNewSplit={handleReset}
        historyCount={historyRecords.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        privacyMode={privacyMode}
        onTogglePrivacyMode={() => setPrivacyMode(!privacyMode)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Offline Alert */}
        {!isOnline && (
          <div className="bg-neutral-900 text-white dark:bg-white dark:text-black text-xs py-2 px-4 text-center flex items-center justify-center gap-2 no-print">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline mode active. All splits and QRs run completely on your device.</span>
          </div>
        )}

        {/* Minimal App Header */}
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          privacyMode={privacyMode}
          onTogglePrivacyMode={() => setPrivacyMode(!privacyMode)}
          onReset={handleReset}
          hasActiveSession={step !== 'upload' || splitPayments.length > 0}
          activeView={activeView}
        />

        {/* Main Content Area (with safe-area padding for mobile bottom bar) */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-12">
          <AnimatePresence mode="wait">
            {activeView === 'history' ? (
              /* History Page View */
              <HistoryPage
                key="history-page"
                records={historyRecords}
                onResumeSplit={handleResumeSplit}
                onDeleteRecord={handleDeleteRecord}
                onClearAll={handleClearAllHistory}
                onStartNewSplit={handleReset}
                onToggleStatusInHistory={handleToggleStatusInHistory}
              />
            ) : (
              /* Split Generation Workflow */
              <motion.div
                key="split-view"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Step Progress Indicator */}
                <div className="mb-6 sm:mb-8">
                  <WorkflowProgress
                    currentStep={step}
                    onStepClick={(targetStep) => {
                      if (targetStep === 'upload') handleReset();
                      else if (targetStep === 'configure' && originalPayment) setStep('configure');
                      else if (targetStep === 'results' && splitPayments.length > 0) setStep('results');
                    }}
                    canNavigateTo={(targetStep) => {
                      if (targetStep === 'upload') return true;
                      if (targetStep === 'configure') return !!originalPayment;
                      if (targetStep === 'results') return splitPayments.length > 0;
                      return false;
                    }}
                  />
                </div>

                {/* STEP 1: Details / Input View */}
                {step === 'upload' && (
                  <div className="space-y-6 no-print text-center">
                    {/* Clean Minimal Hero */}
                    <div className="max-w-xl mx-auto pt-1 pb-1">
                      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                        Split UPI Payments
                      </h1>
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                        Enter phone number, UPI ID, or upload a QR code. Split into smaller amounts on your device.
                      </p>
                    </div>

                    {/* Input Mode Toggle (Enter Manually vs Upload QR) */}
                    <div className="flex items-center justify-center">
                      <div className="inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <button
                          type="button"
                          id="tab-manual-entry"
                          onClick={() => setInputTab('manual')}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer select-none ${
                            inputTab === 'manual'
                              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Enter Details</span>
                        </button>
                        <button
                          type="button"
                          id="tab-upload-qr"
                          onClick={() => setInputTab('qr')}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer select-none ${
                            inputTab === 'qr'
                              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Upload or Scan QR</span>
                        </button>
                      </div>
                    </div>

                    {/* Input Forms */}
                    {inputTab === 'manual' ? (
                      <ManualEntryForm onSuccess={handlePaymentParsed} />
                    ) : (
                      <QRUploader
                        onSuccess={handlePaymentParsed}
                        onOpenScanner={() => setShowScanner(true)}
                        onOpenPasteModal={() => setShowPasteModal(true)}
                      />
                    )}

                    {/* Trust Badges */}
                    <div className="pt-2 max-w-xl mx-auto">
                      <TrustIndicators />
                      <div className="mt-3">
                        <PrivacyCallout />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Configure Split */}
                {step === 'configure' && originalPayment && (
                  <div className="no-print">
                    <PaymentDetails
                      originalPayment={originalPayment}
                      initialAmount={originalPayment.am || totalAmount}
                      onProceed={handleProceedToReview}
                      onBack={() => setStep('upload')}
                    />
                  </div>
                )}

                {/* STEP 4: Results View */}
                {step === 'results' && originalPayment && (
                  <div>
                    <SplitResultsView
                      originalPayment={originalPayment}
                      payments={splitPayments}
                      totalAmount={totalAmount}
                      onStatusChange={handleStatusChange}
                      onModifySplit={() => setStep('configure')}
                      onResetAll={handleReset}
                    />
                  </div>
                )}

                {/* Regulatory Accordion */}
                <RegulatoryDisclaimer />

                {/* Printable Summary for Print Mode */}
                {originalPayment && splitPayments.length > 0 && (
                  <PrintableSummary
                    originalPayment={originalPayment}
                    payments={splitPayments}
                    totalAmount={totalAmount}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 3 MODAL: Review & Confirmation */}
          {showConfirmModal && originalPayment && (
            <UserConfirmationModal
              originalPayment={originalPayment}
              splitAmounts={pendingSplitAmounts}
              totalAmount={totalAmount}
              onConfirm={handleConfirmAndGenerate}
              onCancel={() => setShowConfirmModal(false)}
              isGenerating={isGeneratingQRs}
            />
          )}

          {/* Camera Scanner Modal */}
          {showScanner && (
            <QRScanner
              onScan={(text) => {
                const res = parseUPIUri(text);
                if (res.success && res.payment) {
                  handlePaymentParsed(res.payment, res.hasAmount);
                }
              }}
              onClose={() => setShowScanner(false)}
            />
          )}

          {/* Paste UPI Link Modal */}
          {showPasteModal && (
            <PasteUPIModal
              onSuccess={handlePaymentParsed}
              onClose={() => setShowPasteModal(false)}
            />
          )}
        </main>

        {/* Minimal Footer */}
        <Footer />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavigation
        currentTab={activeView}
        onSelectTab={setActiveView}
        onNewSplit={handleReset}
        historyCount={historyRecords.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
    </div>
  );
}
