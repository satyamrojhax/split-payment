import QRCode from 'qrcode';

export interface QRGenerationResult {
  dataUrl: string;
  svgString: string;
}

/**
 * Generates high-fidelity client-side QR codes styled with Fold fintech palette:
 * Dark navy (#20294c) on Pure White (#ffffff).
 */
export async function generatePaymentQR(
  upiUri: string,
  size = 400
): Promise<QRGenerationResult> {
  const qrOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: size,
    color: {
      dark: '#20294c',  // Fold Midnight Navy
      light: '#ffffff', // Pure White
    },
  };

  const [dataUrl, svgString] = await Promise.all([
    QRCode.toDataURL(upiUri, qrOptions),
    QRCode.toString(upiUri, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#20294c',
        light: '#ffffff',
      },
    }),
  ]);

  return { dataUrl, svgString };
}
