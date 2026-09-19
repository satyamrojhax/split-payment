import JSZip from 'jszip';
import { SplitPayment, UPIPayment } from '../types/upi';
import { formatINR } from '../utils/currency';
import { createBrandedPaymentCardBlob } from './imageExporter';

/**
 * Packages all split QR codes into a single downloadable ZIP file: SplitPay-QRs.zip
 * Everything generated in-browser using JSZip, 100% client-side.
 */
export async function downloadAllQRsZip(
  payments: SplitPayment[],
  original: UPIPayment
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('SplitPay-QRs');

  // Summary Text file
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const recipient = original.pn || 'UPI Merchant';
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  let summaryText = `SPLITPAY — PAYMENT SUMMARY\n`;
  summaryText += `==========================================\n`;
  summaryText += `Generated on: ${dateStr}\n`;
  summaryText += `Recipient:    ${recipient}\n`;
  summaryText += `UPI ID:       ${original.pa}\n`;
  summaryText += `Total Amount: ${formatINR(totalAmount)}\n`;
  summaryText += `Split Count:  ${payments.length} payments\n`;
  summaryText += `==========================================\n\n`;
  summaryText += `PAYMENT BREAKDOWN:\n`;

  for (const payment of payments) {
    const padIndex = payment.index.toString().padStart(2, '0');
    const amtStr = Math.round(payment.amount).toString();
    summaryText += `Payment ${padIndex}: ${formatINR(payment.amount)} (Ref: ${payment.referenceId})\n`;
    summaryText += `  URI: ${payment.uri}\n\n`;

    // Convert card blob to arrayBuffer for ZIP
    const blob = await createBrandedPaymentCardBlob(payment, original);
    const arrayBuffer = await blob.arrayBuffer();
    folder?.file(`${padIndex}-${amtStr}.png`, arrayBuffer);
  }

  summaryText += `==========================================\n`;
  summaryText += `Privacy Notice: Processed 100% locally on device.\n`;
  summaryText += `Disclaimer: SplitPay does not determine whether a transaction attracts MDR.\n`;

  zip.file('README-Summary.txt', summaryText);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'SplitPay-QRs.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
