import React, { useRef, useState } from 'react';
import { Upload, Camera, Link2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { decodeQRFromImage } from '../lib/qrDecoder';
import { parseUPIUri } from '../lib/upiParser';
import { UPIPayment } from '../types/upi';

interface QRUploaderProps {
  onSuccess: (payment: UPIPayment, hasAmount: boolean) => void;
  onOpenScanner: () => void;
  onOpenPasteModal: () => void;
}

export const QRUploader: React.FC<QRUploaderProps> = ({
  onSuccess,
  onOpenScanner,
  onOpenPasteModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(png|jpe?g|webp)$/i)) {
        throw new Error('Please upload an image file (PNG, JPG, or WEBP).');
      }

      const decodeResult = await decodeQRFromImage(file);
      if (!decodeResult.success || !decodeResult.data) {
        throw new Error(decodeResult.error || 'Could not read QR code from this image.');
      }

      const parsed = parseUPIUri(decodeResult.data);
      if (!parsed.success || !parsed.payment) {
        throw new Error(parsed.error || 'This QR is not a valid UPI payment QR code.');
      }

      onSuccess(parsed.payment, parsed.hasAmount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reading image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 text-left">
      {/* Upload Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) processFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        id="qr-upload-dropzone"
        className={`relative rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition border-2 border-dashed ${
          isDragging
            ? 'border-black dark:border-white bg-neutral-100 dark:bg-neutral-900'
            : 'border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-500 dark:hover:border-neutral-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileChange}
          className="hidden"
          id="qr-file-input"
        />

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight mb-1">
            Drop your QR code screenshot
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mb-4">
            Supports PNG, JPG, or WEBP screenshot from any UPI app
          </p>

          <button
            type="button"
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Reading on device...' : 'Choose Image'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 flex items-center gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Other Options: Camera Scan & Paste Link */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenScanner}
          id="btn-scan-camera"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 font-semibold text-xs transition"
        >
          <Camera className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <span>Scan with Camera</span>
        </button>

        <button
          type="button"
          onClick={onOpenPasteModal}
          id="btn-paste-link"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 font-semibold text-xs transition"
        >
          <Link2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <span>Paste UPI Link</span>
        </button>
      </div>
    </div>
  );
};
