import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle, RefreshCw } from 'lucide-react';
import { decodeQRFromImageData } from '../lib/qrDecoder';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    let isActive = true;

    async function startCamera() {
      setIsInitializing(true);
      setHasPermissionError(false);
      setErrorMessage(null);

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported in this browser.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setIsInitializing(false);
          scanLoop();
        }
      } catch (err) {
        if (!isActive) return;
        setIsInitializing(false);
        setHasPermissionError(true);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setErrorMessage('Camera permission was denied. You can upload a QR screenshot instead.');
          } else {
            setErrorMessage(err.message || 'Camera could not be started.');
          }
        } else {
          setErrorMessage('Camera could not be started.');
        }
      }
    }

    startCamera();

    return () => {
      isActive = false;
      stopCamera();
    };
  }, []);

  const scanLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = decodeQRFromImageData(imageData);

        if (decoded) {
          stopCamera();
          onScan(decoded);
          return;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanLoop);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 text-left">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Scan UPI QR</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay Frame */}
          {!hasPermissionError && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="relative w-56 h-56 border-2 border-white/60 rounded-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white" />
              </div>
            </div>
          )}

          {/* Loading */}
          {isInitializing && !hasPermissionError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white">
              <RefreshCw className="w-6 h-6 animate-spin text-white mb-2" />
              <p className="text-xs font-medium">Starting camera...</p>
            </div>
          )}

          {/* Permission Error */}
          {hasPermissionError && (
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center bg-white dark:bg-neutral-900 text-center">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mb-2.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Camera Unavailable</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 max-w-xs">{errorMessage}</p>
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
              >
                Upload QR Image Instead
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Align the QR code within the frame to scan automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
