import { QRGenerator } from '../core/qr-generator';
import type { URLHashManager } from '../core/url-hash-manager';
import { FilenameSanitizer } from '../utils/filename-sanitizer';
import { sanitizeSVG, sanitizeRemoveSVGStyles } from '../utils/svg-sanitizer';

export interface QRCodeControllerOptions {
  containerSelector: string;
  inputSelector: string;
  qrGenerator: QRGenerator;
  urlHashManager: URLHashManager;
}

export interface QRCodeControllerElements {
  container: HTMLDivElement;
  input: HTMLInputElement;
}

export class QRCodeController {
  private elements: QRCodeControllerElements;
  private qrGenerator: QRGenerator;
  private urlHashManager: URLHashManager;
  private unstyledSVGContent: string | null = null;
  private styledSVGContent: string | null = null;
  private abortController: AbortController | null = null;

  constructor(options: QRCodeControllerOptions) {
    this.qrGenerator = options.qrGenerator;
    this.urlHashManager = options.urlHashManager;

    const container = document.querySelector<HTMLDivElement>(options.containerSelector);
    const input = document.querySelector<HTMLInputElement>(options.inputSelector);

    if (!container || !input) {
      throw new Error('Required DOM elements not found');
    }

    this.elements = { container, input };
  }

  async initialize(): Promise<void> {
    try {
      // Initialize URL hash if empty
      this.initializeHash();

      // Set initial input value
      this.elements.input.value = this.getCurrentText();

      // Generate initial QR code
      await this.updateQRCode();

      // Setup event listeners
      this.setupEventListeners();
    } catch (error) {
      this.handleError(error);
    }
  }

  private initializeHash(): void {
    const currentHash = this.urlHashManager.getHash();
    if (!currentHash) {
      const baseURL = this.urlHashManager.getBaseURL();
      this.urlHashManager.setHash(baseURL);
    }
  }

  private getCurrentText(): string {
    const hash = this.urlHashManager.getHash();
    return hash || this.urlHashManager.getBaseURL();
  }

  private setupEventListeners(): void {
    // Cleanup any existing listeners
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    // Input change handler
    this.elements.input.addEventListener('input', this.handleInputChange.bind(this), { signal });

    // Hash change handler
    window.addEventListener('hashchange', this.handleHashChange.bind(this), { signal });
  }

  private async handleInputChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    try {
      if (value === '') {
        this.urlHashManager.removeHash();
      } else {
        this.urlHashManager.setHash(value);
      }
      await this.updateQRCode();
    } catch (error) {
      this.handleError(error);
    }
  }

  private async handleHashChange(): Promise<void> {
    try {
      this.elements.input.value = this.getCurrentText();
      await this.updateQRCode();
    } catch (error) {
      this.handleError(error);
    }
  }

  private async updateQRCode(): Promise<void> {
    const text = this.getCurrentText();

    try {
      const rawSVG = await this.qrGenerator.generateSVG(text);
      this.styledSVGContent = sanitizeSVG(rawSVG);
      this.unstyledSVGContent = sanitizeRemoveSVGStyles(this.styledSVGContent);
      this.renderQRCode();
    } catch (error) {
      throw new Error(
        `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private renderQRCode(): void {
    if (!this.unstyledSVGContent || !this.styledSVGContent) return;

    // Clear container
    this.elements.container.innerHTML = '';

    // Create download link
    const a = document.createElement('a');
    const currentText = this.getCurrentText();
    a.download = FilenameSanitizer.generateQRCodeFilename(currentText);
    a.title = 'Click to download';
    a.setAttribute('aria-label', `Download QR code for: ${currentText}`);

    // Create data URL for SVG
    const blob = new Blob([this.styledSVGContent], { type: 'image/svg+xml' });
    a.href = URL.createObjectURL(blob);

    // Parse SVG and append to link
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.unstyledSVGContent, 'image/svg+xml');
    const svgElement = doc.documentElement as unknown as SVGElement;

    // Add accessible label to SVG
    const ariaLabel = `QR code for: ${currentText}`;
    svgElement.setAttribute('aria-label', ariaLabel);
    svgElement.setAttribute('role', 'img');

    a.appendChild(svgElement);

    // Append link to container
    this.elements.container.appendChild(a);
  }

  private handleError(error: unknown): void {
    console.error('QR Code Controller Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    // Clear container and create error message safely
    this.elements.container.innerHTML = '';
    const errorDiv = document.createElement('div');

    const errorText = document.createTextNode(
      `Error: ${errorMessage}. Please refresh the page and try again.`
    );
    errorDiv.appendChild(errorText);

    this.elements.container.appendChild(errorDiv);
  }

  destroy(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
