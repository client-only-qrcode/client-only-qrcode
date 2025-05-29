# Client-Only QR Code Generator

[![Deployment Status](https://github.com/client-only-qrcode/client-only-qrcode/actions/workflows/deploy.yml/badge.svg)](https://github.com/client-only-qrcode/client-only-qrcode/actions)
[![CI Status](https://github.com/client-only-qrcode/client-only-qrcode/actions/workflows/ci.yml/badge.svg)](https://github.com/client-only-qrcode/client-only-qrcode/actions/workflows/ci.yml)

A browser-based QR code generator that works entirely on the client side. Generate QR codes from
text input and download them as images.

A deployment of this project is available at:
[client-only-qrcode.github.io](https://client-only-qrcode.github.io/)

## Features

- Generate QR codes from any text input.
- Automatically saves state in URL hash (shareable links).
- Download QR codes as SVG files.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/client-only-qrcode.git
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

## Usage

1. Start development server:

   ```bash
   pnpm dev
   ```

2. Open `http://localhost:5173` in your browser.

3. Enter text in the input field to generate a QR code.

4. Click the QR code to download it as an SVG file.

## Development scripts

- `pnpm dev`: Start development server.
- `pnpm build`: Create production build.
- `pnpm preview`: Preview production build.
- `pnpm test`: Run tests.
- `pnpm lint`: Run linters.
- `pnpm format`: Format code.

## Deployment

To deploy manually:

1. Push changes to the `main` branch.
2. GitHub Actions will run the CI workflow:
   - Runs linting checks
   - Runs tests with coverage
   - Builds the production bundle
3. If CI passes, the deployment workflow will:
   - Download the built artifacts
   - Deploy to GitHub Pages
4. Your updated site will be live within minutes.

The deployment will only occur if all CI checks pass.
