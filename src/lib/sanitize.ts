import DOMPurify from 'dompurify';

// Create DOMPurify instance
const domPurify = DOMPurify();

// Configure DOMPurify with secure defaults
domPurify.setConfig({
  WHOLE_DOCUMENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  SANITIZE_DOM: true,
  KEEP_CONTENT: false,
  IN_PLACE: false,
  ALLOWED_TAGS: ['svg', 'path', 'g', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'text', 'tspan', 'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask'],
  ALLOWED_ATTR: ['class', 'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'transform', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'points', 'offset', 'stop-color', 'stop-opacity', 'clip-path', 'mask'],
  FORBID_TAGS: ['script', 'object', 'embed', 'applet', 'iframe'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
});

/**
 * Sanitizes SVG content to prevent XSS attacks
 * @param svgContent - Raw SVG content as string
 * @returns Sanitized SVG content safe for innerHTML
 */
export const sanitizeSvg = (svgContent: string): string => {
  if (!svgContent || typeof svgContent !== 'string') {
    return '';
  }

  try {
    // Additional validation for SVG structure
    if (!svgContent.includes('<svg')) {
      console.warn('Invalid SVG content: missing <svg> tag');
      return '';
    }

    // Sanitize the SVG content
    const sanitized = domPurify.sanitize(svgContent, {
      USE_PROFILES: { svg: true, svgFilters: true }
    });

    // Additional check to ensure we still have valid content after sanitization
    if (!sanitized || !sanitized.includes('<svg')) {
      console.warn('SVG content was removed during sanitization');
      return '';
    }

    return sanitized;
  } catch (error) {
    console.error('Error sanitizing SVG:', error);
    return '';
  }
};

/**
 * Sanitizes general HTML content to prevent XSS attacks
 * @param htmlContent - Raw HTML content as string
 * @returns Sanitized HTML content safe for innerHTML
 */
export const sanitizeHtml = (htmlContent: string): string => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  try {
    return domPurify.sanitize(htmlContent);
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return '';
  }
};

/**
 * Validates and sanitizes CSS for style injection
 * @param cssContent - Raw CSS content as string
 * @returns Sanitized CSS content safe for style injection
 */
export const sanitizeCss = (cssContent: string): string => {
  if (!cssContent || typeof cssContent !== 'string') {
    return '';
  }

  try {
    // Remove potentially dangerous CSS properties and values
    const dangerousPatterns = [
      /javascript:/gi,
      /expression\s*\(/gi,
      /url\s*\(\s*['"]*javascript:/gi,
      /behavior\s*:/gi,
      /-moz-binding/gi,
      /import/gi,
      /@import/gi
    ];

    let sanitized = cssContent;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  } catch (error) {
    console.error('Error sanitizing CSS:', error);
    return '';
  }
};

/**
 * Creates a safe innerHTML object with sanitized content
 * @param content - Raw content to sanitize
 * @param type - Type of content ('svg' | 'html' | 'css')
 * @returns Object safe for dangerouslySetInnerHTML
 */
export const createSafeInnerHTML = (content: string, type: 'svg' | 'html' | 'css' = 'html') => {
  let sanitized = '';
  
  switch (type) {
    case 'svg':
      sanitized = sanitizeSvg(content);
      break;
    case 'css':
      sanitized = sanitizeCss(content);
      break;
    case 'html':
    default:
      sanitized = sanitizeHtml(content);
      break;
  }

  return { __html: sanitized };
};