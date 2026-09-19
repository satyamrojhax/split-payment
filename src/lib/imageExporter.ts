import { SplitPayment, UPIPayment } from '../types/upi';
import { formatINR } from '../utils/currency';

/**
 * Downloads a single QR image directly in browser.
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a polished, labeled payment card image with recipient, amount, and QR code.
 */
export async function createBrandedPaymentCardBlob(
  payment: SplitPayment,
  original: UPIPayment
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context');

  const width = 600;
  const height = 750;
  canvas.width = width;
  canvas.height = height;

  // Background - Fog White
  ctx.fillStyle = '#f0f1f5';
  ctx.fillRect(0, 0, width, height);

  // Card background - Pure White with rounded corners
  const cardX = 30;
  const cardY = 30;
  const cardW = width - 60;
  const cardH = height - 60;
  const radius = 24;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fill();

  // Subtle stroke
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#dddfe9';
  ctx.stroke();

  // Header tag: SplitPay - Part X of Y
  ctx.fillStyle = '#20294c';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Payment ${payment.index}`, width / 2, 85);

  ctx.fillStyle = '#676b89';
  ctx.font = '16px system-ui, -apple-system, sans-serif';
  ctx.fillText('SplitPay Secure On-Device Intent', width / 2, 115);

  // Draw QR Image in the center
  if (payment.qrDataUrl) {
    const qrImg = new Image();
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = reject;
      qrImg.src = payment.qrDataUrl!;
    });
    const qrSize = 360;
    const qrX = (width - qrSize) / 2;
    const qrY = 140;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  }

  // Large Amount Typography (GT Walsheim / bold poster style)
  ctx.fillStyle = '#20294c';
  ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
  ctx.fillText(formatINR(payment.amount), width / 2, 555);

  // Recipient info
  const recipientName = original.pn || 'UPI Merchant';
  ctx.fillStyle = '#20294c';
  ctx.font = '600 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(recipientName, width / 2, 595);

  ctx.fillStyle = '#676b89';
  ctx.font = '16px monospace';
  ctx.fillText(original.pa, width / 2, 625);

  // Safety notice footer
  ctx.fillStyle = '#979db5';
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillText('Verify recipient before paying • 100% Client-Side QR', width / 2, 675);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create card image blob'));
    }, 'image/png');
  });
}

/**
 * Downloads a single QR code image.
 */
export async function downloadPaymentQR(
  payment: SplitPayment,
  original: UPIPayment,
  asBrandedCard = false
) {
  const filename = `payment-${payment.index}-${Math.round(payment.amount)}.png`;

  if (asBrandedCard) {
    const blob = await createBrandedPaymentCardBlob(payment, original);
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else if (payment.qrDataUrl) {
    downloadDataUrl(payment.qrDataUrl, filename);
  }
}

/**
 * Shares QR code via Web Share API or falls back to download.
 */
export async function sharePaymentQR(
  payment: SplitPayment,
  original: UPIPayment
): Promise<{ success: boolean; fallbackUsed: boolean }> {
  try {
    const blob = await createBrandedPaymentCardBlob(payment, original);
    const filename = `payment-${payment.index}-${Math.round(payment.amount)}.png`;
    const file = new File([blob], filename, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `SplitPay — Payment ${payment.index} of ${formatINR(payment.amount)}`,
        text: `UPI payment ${formatINR(payment.amount)} to ${original.pn || original.pa}`,
        files: [file],
      });
      return { success: true, fallbackUsed: false };
    } else if (navigator.share) {
      await navigator.share({
        title: `SplitPay — Payment ${payment.index}`,
        text: `UPI payment ${formatINR(payment.amount)} to ${original.pn || original.pa}: ${payment.uri}`,
        url: payment.uri,
      });
      return { success: true, fallbackUsed: false };
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return { success: false, fallbackUsed: false };
    }
  }

  // Fallback to direct download
  await downloadPaymentQR(payment, original, true);
  return { success: true, fallbackUsed: true };
}
