export interface FileDownloadOptions {
  filename: string;
  content: string;
  mimeType: string;
}

export interface FileDownloader {
  download(options: FileDownloadOptions): void;
}

export class BrowserFileDownloader implements FileDownloader {
  private document: Document;
  private urlConstructor: typeof URL;

  constructor(
    document: Document = globalThis.document,
    urlConstructor: typeof globalThis.URL = globalThis.URL
  ) {
    this.document = document;
    this.urlConstructor = urlConstructor;
  }

  download({ filename, content, mimeType }: FileDownloadOptions): void {
    const blob = new Blob([content], { type: mimeType });
    const url = this.urlConstructor.createObjectURL(blob);

    const anchor = this.document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';

    this.document.body.appendChild(anchor);
    anchor.click();
    this.document.body.removeChild(anchor);

    this.urlConstructor.revokeObjectURL(url);
  }
}

// For testing purposes
export class MockFileDownloader implements FileDownloader {
  public downloadedFiles: FileDownloadOptions[] = [];

  download(options: FileDownloadOptions): void {
    this.downloadedFiles.push(options);
  }

  getLastDownload(): FileDownloadOptions | undefined {
    return this.downloadedFiles[this.downloadedFiles.length - 1];
  }

  clearHistory(): void {
    this.downloadedFiles = [];
  }
}
