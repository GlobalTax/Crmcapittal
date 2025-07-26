import React from 'react';
import DOMPurify from 'dompurify';
import { useSecureInput } from '@/hooks/useSecureInput';

interface SecureHtmlRendererProps {
  content: string;
  className?: string;
  allowBasicFormatting?: boolean;
  maxLength?: number;
}

export const SecureHtmlRenderer = ({ 
  content, 
  className = '',
  allowBasicFormatting = true,
  maxLength = 10000
}: SecureHtmlRendererProps) => {
  const { sanitizeInput } = useSecureInput();

  const getSanitizedContent = () => {
    try {
      // First sanitize with our custom hook
      const basicSanitized = sanitizeInput(content, {
        allowHtml: allowBasicFormatting,
        maxLength,
        trimWhitespace: true
      });

      // Then apply DOMPurify with restrictive settings
      const purified = DOMPurify.sanitize(basicSanitized, {
        ALLOWED_TAGS: allowBasicFormatting 
          ? ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] 
          : [],
        ALLOWED_ATTR: [],
        FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'img', 'iframe', 'form', 'input'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        SANITIZE_DOM: true,
        WHOLE_DOCUMENT: false,
        FORCE_BODY: false
      });

      return purified;
    } catch (error) {
      console.error('Error sanitizing HTML content:', error);
      return 'Error al procesar el contenido';
    }
  };

  const processedContent = getSanitizedContent();

  // Use a secure render method instead of dangerouslySetInnerHTML
  if (!allowBasicFormatting) {
    return (
      <div className={className}>
        {processedContent}
      </div>
    );
  }

  // For formatted content, use DOMPurify's safe rendering
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

// Utility function for processing content safely
export const processContentSecurely = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove dangerous patterns first
  let processed = content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  // Apply DOMPurify sanitization
  processed = DOMPurify.sanitize(processed, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'img', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  });

  return processed;
};