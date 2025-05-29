export interface URLHashManager {
  getHash(): string;
  setHash(value: string): void;
  removeHash(): void;
  getCurrentURL(): string;
  getBaseURL(): string;
}

export class BrowserURLHashManager implements URLHashManager {
  private window: Window;
  private history: History;

  constructor(window: Window = globalThis.window, history: History = globalThis.history) {
    this.window = window;
    this.history = history;
  }

  getHash(): string {
    const hash = this.window.location.hash;
    return hash ? decodeURIComponent(hash.slice(1)) : '';
  }

  setHash(value: string): void {
    if (value) {
      this.window.location.hash = encodeURIComponent(value);
    } else {
      this.removeHash();
    }
  }

  removeHash(): void {
    const { pathname, search } = this.window.location;
    this.history.pushState('', document.title, pathname + search);
  }

  getCurrentURL(): string {
    return this.window.location.href;
  }

  getBaseURL(): string {
    return this.getCurrentURL().split('#')[0];
  }
}

// For testing purposes
export class MockURLHashManager implements URLHashManager {
  private hash = '';
  private baseURL = 'http://localhost:3000/';

  getHash(): string {
    return this.hash;
  }

  setHash(value: string): void {
    this.hash = value;
  }

  removeHash(): void {
    this.hash = '';
  }

  getCurrentURL(): string {
    return this.baseURL + (this.hash ? `#${encodeURIComponent(this.hash)}` : '');
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  setBaseURL(url: string): void {
    this.baseURL = url;
  }
}
