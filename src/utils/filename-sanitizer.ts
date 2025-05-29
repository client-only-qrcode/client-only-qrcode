export interface FilenameSanitizerOptions {
  maxLength?: number;
  defaultName?: string;
  allowedCharacters?: RegExp;
}

export class FilenameSanitizer {
  private static readonly DEFAULT_OPTIONS: Required<FilenameSanitizerOptions> = {
    maxLength: 50,
    defaultName: 'download',
    allowedCharacters: /[^a-zA-Z0-9.-]/g,
  };

  static sanitize(filename: string, options?: FilenameSanitizerOptions): string {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };

    // Replace non-allowed characters with underscores
    let sanitized = filename.replace(mergedOptions.allowedCharacters, '_');

    // Truncate to max length
    sanitized = sanitized.substring(0, mergedOptions.maxLength);

    // If empty or only underscores after sanitization, use default name
    const isOnlyUnderscores = /^_*$/.test(sanitized);
    return !sanitized || isOnlyUnderscores ? mergedOptions.defaultName : sanitized;
  }

  static generateQRCodeFilename(text: string): string {
    const sanitizedText = this.sanitize(text);
    return `qr_code_${sanitizedText}.svg`;
  }
}
