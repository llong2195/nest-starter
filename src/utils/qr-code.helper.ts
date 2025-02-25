import { QRCodeToFileStreamOptions, toFileStream } from 'qrcode';
import { PassThrough } from 'stream';

export class QrCodeHelper {
  static async generateQR(text: string, size = 108, qualityLevel = 'M') {
    const qrStream = new PassThrough();
    await toFileStream(qrStream, text, {
      width: size,
      errorCorrectionLevel: qualityLevel,
    } as QRCodeToFileStreamOptions);
    return qrStream;
  }
}
