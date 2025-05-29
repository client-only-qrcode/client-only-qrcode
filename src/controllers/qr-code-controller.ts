import { QRGenerator } from '../core/qr-generator';
import type { URLHashManager } from '../core/url-hash-manager';
import type { FileDownloader } from '../core/file-downloader';
import { FilenameSanitizer } from '../utils/filename-sanitizer';
import { sanitizeSVG } from '../utils/svg-sanitizer';

export interface QRCodeControllerOptions {
  containerSelector: string;
  inputSelector: string;
  qrGenerator: QRGenerator;
  urlHashManager: URLHashManager;
  fileDownloader: FileDownloader;
}

export interface QRCodeControllerElements {
  container: HTMLDivElement;
  input: HTMLInputElement;
}

export class QRCodeController {
  private elements: QRCodeControllerElements;
  private qrGenerator: QRGenerator;
  private urlHashManager: URLHashManager;
  private fileDownloader: FileDownloader;
  private currentSVGContent: string | null = null;
  private abortController: AbortController | null = null;

  constructor(options: QRCodeControllerOptions) {
    this.qrGenerator = options.qrGenerator;
    this.urlHashManager = options.urlHashManager;
    this.fileDownloader = options.fileDownloader;

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
      this.currentSVGContent = sanitizeSVG(rawSVG);
      this.renderQRCode();
    } catch (error) {
      throw new Error(
        `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private renderQRCode(): void {
    if (!this.currentSVGContent) return;

    // Clear container
    this.elements.container.innerHTML = '';

    // Parse SVG and append safely
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.currentSVGContent, 'image/svg+xml');
    const svgElement = doc.documentElement as unknown as SVGElement;
    this.elements.container.appendChild(svgElement);
    this.attachDownloadHandler(svgElement);
  }

  private attachDownloadHandler(svgElement: SVGElement): void {
    svgElement.setAttribute('title', 'Click to download');

    svgElement.addEventListener('click', this.handleDownload.bind(this), {
      signal: this.abortController?.signal,
    });
  }

  private handleDownload(): void {
    if (!this.currentSVGContent) return;

    const currentText = this.getCurrentText();
    const filename = FilenameSanitizer.generateQRCodeFilename(currentText);

    this.fileDownloader.download({
      filename,
      content: this.currentSVGContent,
      mimeType: 'image/svg+xml',
    });
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
