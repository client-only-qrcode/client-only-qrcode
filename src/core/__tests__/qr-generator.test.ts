import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QRGenerator } from '../qr-generator';

// Mock the qrcode-svg module
vi.mock('qrcode-svg', () => {
  return {
    default: class {
      constructor(options: { content: string }) {
        if (options.content === 'error') {
          throw new Error('QR generation failed');
        }
      }
      svg() {
        return '<svg>Mocked QR Code</svg>';
      }
    },
  };
});

describe('QRGenerator', () => {
  let generator: QRGenerator;

  beforeEach(() => {
    generator = new QRGenerator();
  });

  describe('generateSVG', () => {
    it('should generate SVG for valid text', async () => {
      const result = await generator.generateSVG('Hello World');
      expect(result).toBe('<svg>Mocked QR Code</svg>');
    });

    it('should handle errors gracefully', async () => {
      await expect(generator.generateSVG('error')).rejects.toThrow(
        'Failed to generate QR code: QR generation failed'
      );
    });
  });
});
