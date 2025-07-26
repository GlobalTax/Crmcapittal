import { useCallback } from 'react';
import DOMPurify from 'dompurify';

interface SecureInputOptions {
  maxLength?: number;
  allowHtml?: boolean;
  trimWhitespace?: boolean;
}

export const useSecureInput = () => {
  const sanitizeInput = useCallback((
    input: string, 
    options: SecureInputOptions = {}
  ): string => {
    const {
      maxLength = 10000,
      allowHtml = false,
      trimWhitespace = true
    } = options;

    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Trim whitespace if requested
    if (trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Length validation
    if (sanitized.length > maxLength) {
      throw new Error(`Entrada demasiado larga. Máximo ${maxLength} caracteres.`);
    }

    // Check for SQL injection patterns
    const sqlPatterns = /(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)/gi;
    if (sqlPatterns.test(sanitized)) {
      throw new Error('Entrada contiene patrones de SQL peligrosos');
    }

    // Check for XSS patterns
    const xssPatterns = /(javascript:|vbscript:|on\w+\s*=|<script|eval\(|expression\()/gi;
    if (xssPatterns.test(sanitized)) {
      throw new Error('Entrada contiene patrones de script peligrosos');
    }

    // HTML sanitization
    if (allowHtml) {
      // Configure DOMPurify with restrictive settings
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: [],
        FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'img'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      });
    } else {
      // Remove all HTML tags and dangerous patterns
      sanitized = sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }

    return sanitized;
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateUrl = useCallback((url: string): boolean => {
    try {
      const urlObject = new URL(url);
      return ['http:', 'https:'].includes(urlObject.protocol);
    } catch {
      return false;
    }
  }, []);

  const validateUUID = useCallback((uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }, []);

  const sanitizeFilename = useCallback((filename: string): string => {
    return filename
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\.\./g, '')
      .replace(/^\./, '')
      .substring(0, 255);
  }, []);

  return {
    sanitizeInput,
    validateEmail,
    validateUrl,
    validateUUID,
    sanitizeFilename
  };
};