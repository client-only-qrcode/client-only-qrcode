import { QRCodeController } from './controllers/qr-code-controller';
import { QRGenerator } from './core/qr-generator';
import { BrowserURLHashManager } from './core/url-hash-manager';

// Application entry point
async function initializeApp(): Promise<void> {
  try {
    // Create instances of dependencies
    const qrGenerator = new QRGenerator();
    const urlHashManager = new BrowserURLHashManager();

    // Create and initialize the controller
    const controller = new QRCodeController({
      containerSelector: '#qr-code',
      inputSelector: '#input-text',
      qrGenerator,
      urlHashManager,
    });

    await controller.initialize();

    // Add form submit handler to prevent page reload
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
      });
    }

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      controller.destroy();
    });

    // Make controller available for debugging (optional)
    if (import.meta.env.DEV) {
      interface CustomWindow extends Window {
        __qrController?: QRCodeController;
      }
      (window as CustomWindow).__qrController = controller;
    }
  } catch (error) {
    console.error('Failed to initialize QR Code application:', error);

    // Show error in UI
    const container = document.querySelector<HTMLDivElement>('#qr-code');
    if (container) {
      container.innerHTML = `
        <div class="error-message card">
          <p>Failed to initialize the application.</p>
          <p>Please refresh the page and try again.</p>
        </div>
      `;
    }
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}
