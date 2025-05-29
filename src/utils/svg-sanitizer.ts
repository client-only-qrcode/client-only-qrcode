import DOMPurify from 'dompurify';

export function sanitizeSVG(svgContent: string): string {
  // Sanitize SVG content to prevent XSS attacks
  return DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
}

export function sanitizeRemoveSVGStyles(svgContent: string): string {
  // Remove SVG style attributes that trip up Content-Security-Policy
  return DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_ATTR: ['style'],
  });
}
