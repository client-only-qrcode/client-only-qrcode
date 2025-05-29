import DOMPurify from 'dompurify';

/**
 * Sanitizes SVG content to prevent XSS attacks.
 * @param svgContent - The raw SVG string to sanitize
 * @returns Sanitized SVG string safe for DOM insertion
 */
export function sanitizeSVG(svgContent: string): string {
  return DOMPurify.sanitize(svgContent, {
    FORBID_ATTR: ['style'],
  });
}
