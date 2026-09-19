import jsQR from 'jsqr';

export interface QRDecodeResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Decodes a QR code directly in the browser from an image File or Blob.
 * 100% client-side: never uploads or sends the image off the device.
 */
export async function decodeQRFromImage(file: File | Blob): Promise<QRDecodeResult> {
  try {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = objectUrl;
    });

    URL.revokeObjectURL(objectUrl);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return {
        success: false,
        error: 'Canvas 2D context is not supported by your browser.',
      };
    }

    // Limit maximum dimension to 1600px for performance while preserving QR resolution
    let { width, height } = img;
    const maxDim = 1600;
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data) {
      return {
        success: true,
        data: code.data,
      };
    }

    // Secondary pass: if not found, try downscaling slightly or inspecting center crop
    if (width > 600 && height > 600) {
      const smallCanvas = document.createElement('canvas');
      const sWidth = 600;
      const sHeight = Math.round((height / width) * 600);
      smallCanvas.width = sWidth;
      smallCanvas.height = sHeight;
      const sCtx = smallCanvas.getContext('2d', { willReadFrequently: true });
      if (sCtx) {
        sCtx.drawImage(img, 0, 0, sWidth, sHeight);
        const sData = sCtx.getImageData(0, 0, sWidth, sHeight);
        const sCode = jsQR(sData.data, sData.width, sData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (sCode && sCode.data) {
          return {
            success: true,
            data: sCode.data,
          };
        }
      }
    }

    return {
      success: false,
      error: 'This QR code could not be read. Please upload a clearer, well-lit image.',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error decoding QR code.',
    };
  }
}

/**
 * Decodes raw ImageData from camera video stream frame.
 */
export function decodeQRFromImageData(imageData: ImageData): string | null {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    return code?.data || null;
  } catch {
    return null;
  }
}
