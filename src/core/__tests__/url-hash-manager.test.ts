import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserURLHashManager, MockURLHashManager } from '../url-hash-manager';

describe('MockURLHashManager', () => {
  let manager: MockURLHashManager;

  beforeEach(() => {
    manager = new MockURLHashManager();
  });

  it('should get and set hash', () => {
    expect(manager.getHash()).toBe('');

    manager.setHash('test-hash');
    expect(manager.getHash()).toBe('test-hash');
  });

  it('should remove hash', () => {
    manager.setHash('test-hash');
    manager.removeHash();
    expect(manager.getHash()).toBe('');
  });

  it('should get current URL with hash', () => {
    manager.setHash('test-hash');
    expect(manager.getCurrentURL()).toBe('http://localhost:3000/#test-hash');
  });

  it('should get current URL without hash', () => {
    expect(manager.getCurrentURL()).toBe('http://localhost:3000/');
  });

  it('should get base URL', () => {
    manager.setHash('test-hash');
    expect(manager.getBaseURL()).toBe('http://localhost:3000/');
  });

  it('should set base URL', () => {
    manager.setBaseURL('https://example.com/');
    expect(manager.getBaseURL()).toBe('https://example.com/');
    expect(manager.getCurrentURL()).toBe('https://example.com/');
  });
});

describe('BrowserURLHashManager', () => {
  let manager: BrowserURLHashManager;
  let mockWindow: Window;
  let mockHistory: History;

  beforeEach(() => {
    mockWindow = {
      location: {
        hash: '',
        href: 'http://localhost:3000/',
        pathname: '/',
        search: '',
      },
    } as unknown as Window;

    mockHistory = {
      pushState: vi.fn(),
    } as unknown as History;

    manager = new BrowserURLHashManager(mockWindow, mockHistory);
  });

  it('should get hash from window.location', () => {
    mockWindow.location.hash = '#test%20hash';
    expect(manager.getHash()).toBe('test hash');
  });

  it('should return empty string for no hash', () => {
    mockWindow.location.hash = '';
    expect(manager.getHash()).toBe('');
  });

  it('should set hash to window.location', () => {
    manager.setHash('test hash');
    expect(mockWindow.location.hash).toBe('test%20hash');
  });

  it('should remove hash when setting empty string', () => {
    mockWindow.location.hash = '#test';
    manager.setHash('');

    expect(mockHistory.pushState).toHaveBeenCalledWith('', document.title, '/');
  });

  it('should remove hash using history.pushState', () => {
    mockWindow.location.pathname = '/page';
    mockWindow.location.search = '?query=1';

    manager.removeHash();

    expect(mockHistory.pushState).toHaveBeenCalledWith('', document.title, '/page?query=1');
  });

  it('should get current URL', () => {
    mockWindow.location.href = 'http://localhost:3000/page#hash';
    expect(manager.getCurrentURL()).toBe('http://localhost:3000/page#hash');
  });

  it('should get base URL without hash', () => {
    mockWindow.location.href = 'http://localhost:3000/page#hash';
    expect(manager.getBaseURL()).toBe('http://localhost:3000/page');
  });
});
