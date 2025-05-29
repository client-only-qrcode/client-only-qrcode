import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserFileDownloader, MockFileDownloader } from '../file-downloader';

describe('MockFileDownloader', () => {
  let downloader: MockFileDownloader;

  beforeEach(() => {
    downloader = new MockFileDownloader();
  });

  it('should track downloaded files', () => {
    const options = {
      filename: 'test.svg',
      content: '<svg>test</svg>',
      mimeType: 'image/svg+xml',
    };

    downloader.download(options);

    expect(downloader.downloadedFiles).toHaveLength(1);
    expect(downloader.downloadedFiles[0]).toEqual(options);
  });

  it('should get last download', () => {
    downloader.download({
      filename: 'first.svg',
      content: 'content1',
      mimeType: 'image/svg+xml',
    });

    downloader.download({
      filename: 'second.svg',
      content: 'content2',
      mimeType: 'image/svg+xml',
    });

    const lastDownload = downloader.getLastDownload();
    expect(lastDownload?.filename).toBe('second.svg');
  });

  it('should clear history', () => {
    downloader.download({
      filename: 'test.svg',
      content: 'content',
      mimeType: 'image/svg+xml',
    });

    downloader.clearHistory();
    expect(downloader.downloadedFiles).toHaveLength(0);
  });
});

describe('BrowserFileDownloader', () => {
  let downloader: BrowserFileDownloader;
  let mockDocument: Document;
  let mockURL: typeof URL;
  let mockAnchor: HTMLAnchorElement;

  beforeEach(() => {
    mockAnchor = {
      href: '',
      download: '',
      style: { display: '' },
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    mockDocument = {
      createElement: vi.fn().mockReturnValue(mockAnchor),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    } as unknown as Document;

    mockURL = {
      createObjectURL: vi.fn().mockReturnValue('blob:http://localhost/123'),
      revokeObjectURL: vi.fn(),
    } as unknown as typeof URL;

    downloader = new BrowserFileDownloader(mockDocument, mockURL);
  });

  it('should create blob with correct content and type', () => {
    downloader.download({
      filename: 'test.svg',
      content: '<svg>test</svg>',
      mimeType: 'image/svg+xml',
    });

    expect(mockURL.createObjectURL).toHaveBeenCalledWith(
      expect.objectContaining({
        size: 15, // length of "<svg>test</svg>"
        type: 'image/svg+xml',
      })
    );
  });

  it('should create anchor element with correct attributes', () => {
    downloader.download({
      filename: 'test.svg',
      content: '<svg>test</svg>',
      mimeType: 'image/svg+xml',
    });

    expect(mockDocument.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchor.href).toBe('blob:http://localhost/123');
    expect(mockAnchor.download).toBe('test.svg');
    expect(mockAnchor.style.display).toBe('none');
  });

  it('should append, click, and remove anchor element', () => {
    downloader.download({
      filename: 'test.svg',
      content: '<svg>test</svg>',
      mimeType: 'image/svg+xml',
    });

    expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockAnchor);
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockDocument.body.removeChild).toHaveBeenCalledWith(mockAnchor);
  });

  it('should revoke object URL after download', () => {
    downloader.download({
      filename: 'test.svg',
      content: '<svg>test</svg>',
      mimeType: 'image/svg+xml',
    });

    expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/123');
  });
});
