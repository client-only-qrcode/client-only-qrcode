import { describe, it, expect } from 'vitest';
import { FilenameSanitizer } from '../filename-sanitizer';

describe('FilenameSanitizer', () => {
  describe('sanitize', () => {
    it('should replace non-allowed characters with underscores', () => {
      const result = FilenameSanitizer.sanitize('hello@world#test.txt');
      expect(result).toBe('hello_world_test.txt');
    });

    it('should keep allowed characters', () => {
      const result = FilenameSanitizer.sanitize('hello-world.test123.txt');
      expect(result).toBe('hello-world.test123.txt');
    });

    it('should truncate to max length', () => {
      const longName = 'a'.repeat(60);
      const result = FilenameSanitizer.sanitize(longName);
      expect(result).toHaveLength(50);
    });

    it('should use custom max length', () => {
      const longName = 'a'.repeat(60);
      const result = FilenameSanitizer.sanitize(longName, { maxLength: 20 });
      expect(result).toHaveLength(20);
    });

    it('should return default name for empty string after sanitization', () => {
      const result = FilenameSanitizer.sanitize('@#$%^&*()');
      expect(result).toBe('download');
    });

    it('should use custom default name', () => {
      const result = FilenameSanitizer.sanitize('@#$%', { defaultName: 'file' });
      expect(result).toBe('file');
    });

    it('should use custom allowed characters regex', () => {
      const result = FilenameSanitizer.sanitize('hello_world-test', {
        allowedCharacters: /[^a-zA-Z]/g,
      });
      expect(result).toBe('hello_world_test');
    });
  });

  describe('generateQRCodeFilename', () => {
    it('should generate filename with qr_code prefix', () => {
      const result = FilenameSanitizer.generateQRCodeFilename('example.com');
      expect(result).toBe('qr_code_example.com.svg');
    });

    it('should sanitize text in filename', () => {
      const result = FilenameSanitizer.generateQRCodeFilename('https://example.com/path?query=1');
      expect(result).toBe('qr_code_https___example.com_path_query_1.svg');
    });

    it('should handle empty text', () => {
      const result = FilenameSanitizer.generateQRCodeFilename('');
      expect(result).toBe('qr_code_download.svg');
    });

    it('should truncate long text', () => {
      const longText = 'a'.repeat(60);
      const result = FilenameSanitizer.generateQRCodeFilename(longText);
      expect(result).toMatch(/^qr_code_a{50}\.svg$/);
    });
  });
});
