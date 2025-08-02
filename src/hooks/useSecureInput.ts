import { useCallback } from 'react';
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';

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

    // Use client-side validation (enhanced database validation available via async function)
    return clientSideSanitize(input, { maxLength, allowHtml, trimWhitespace });
  }, []);

  const sanitizeInputAsync = useCallback(async (
    input: string, 
    options: SecureInputOptions = {}
  ): Promise<string> => {
    const {
      maxLength = 10000,
      allowHtml = false,
      trimWhitespace = true
    } = options;

    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      // Use enhanced database validation function for better security
      // Note: This function was created in the security migration
      const { data, error } = await supabase.rpc('validate_and_sanitize_input', {
        p_input: input,
        p_max_length: maxLength,
        p_allow_html: allowHtml
      }) as { data: string | null; error: any };

      if (error) {
        console.error('Database validation error:', error);
        // Fallback to client-side validation
        return clientSideSanitize(input, { maxLength, allowHtml, trimWhitespace });
      }

      return (data as string) || '';
    } catch (error) {
      console.error('Sanitization error:', error);
      // Fallback to client-side validation
      return clientSideSanitize(input, { maxLength, allowHtml, trimWhitespace });
    }
  }, []);

  const clientSideSanitize = useCallback((
    input: string,
    options: SecureInputOptions = {}
  ): string => {
    const {
      maxLength = 10000,
      allowHtml = false,
      trimWhitespace = true
    } = options;

    let sanitized = input;

    // Trim whitespace if requested
    if (trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Length validation
    if (sanitized.length > maxLength) {
      throw new Error(`Entrada demasiado larga. Máximo ${maxLength} caracteres.`);
    }

    // Enhanced XSS pattern detection and cleaning
    const xssPatterns = /(javascript:|vbscript:|on\w+\s*=|<script|eval\(|expression\(|<iframe|<object|<embed)/gi;
    if (xssPatterns.test(sanitized)) {
      console.warn('XSS patterns detected in input, cleaning...');
      sanitized = sanitized.replace(xssPatterns, '');
    }

    // SQL injection protection
    const sqlPatterns = /(union|select|insert|update|delete|drop|create|alter|exec|execute)\s/gi;
    if (sqlPatterns.test(sanitized)) {
      console.warn('SQL injection patterns detected, cleaning...');
      sanitized = sanitized.replace(sqlPatterns, '');
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

  const validateEmail = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('validate_email_secure', { 
        p_email: email 
      });
      
      if (error) {
        // Fallback to client-side validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254;
      }
      
      return data || false;
    } catch (error) {
      // Fallback to client-side validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email) && email.length <= 254;
    }
  }, []);

  // Synchronous email validation for backward compatibility
  const validateEmailSync = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
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
    sanitizeInputAsync,
    validateEmail: validateEmailSync, // Keep sync version for compatibility
    validateEmailAsync: validateEmail, // New async version
    validateUrl,
    validateUUID,
    sanitizeFilename
  };
};