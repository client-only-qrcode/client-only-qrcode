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

    const container = document.querySelector<HTMLDivElement>('#qr-code');
    if (container) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message card';

      const errorText = document.createElement('p');
      errorText.textContent = 'Failed to initialize the application.';

      const instructionText = document.createElement('p');
      instructionText.textContent = 'Please refresh the page and try again.';

      errorDiv.appendChild(errorText);
      errorDiv.appendChild(instructionText);

      container.appendChild(errorDiv);
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
