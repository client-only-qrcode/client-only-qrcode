import QRCode from 'qrcode-svg';

export class QRGenerator {
  async generateSVG(text: string): Promise<string> {
    try {
      return new QRCode({
        content: text,
        container: 'svg-viewbox',
        xmlDeclaration: false,
        join: true,
      }).svg();
    } catch (error) {
      throw new Error(
        `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
