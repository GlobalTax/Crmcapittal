// Input validation and sanitization utilities
import DOMPurify from 'dompurify';

export const inputValidation = {
  // Text sanitization
  sanitizeText: (input: string, maxLength?: number): string => {
    if (!input) return '';
    
    // Remove HTML tags and scripts
    const sanitized = DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [] 
    });
    
    // Trim whitespace
    const trimmed = sanitized.trim();
    
    // Apply length limit if specified
    if (maxLength && trimmed.length > maxLength) {
      return trimmed.substring(0, maxLength);
    }
    
    return trimmed;
  },

  // Email validation
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone validation (basic international format)
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,20}$/;
    return phoneRegex.test(phone);
  },

  // Company name validation
  validateCompanyName: (name: string): boolean => {
    if (!name || name.length < 2 || name.length > 100) return false;
    // Allow letters, numbers, spaces, and common business punctuation
    const companyRegex = /^[a-zA-ZÀ-ÿ0-9\s\.,&\-\(\)'"]+$/;
    return companyRegex.test(name);
  },

  // Numeric range validation
  validateNumericRange: (min?: number, max?: number): boolean => {
    if (min === undefined && max === undefined) return true;
    if (min !== undefined && max !== undefined) {
      return min >= 0 && max >= 0 && min <= max;
    }
    if (min !== undefined) return min >= 0;
    if (max !== undefined) return max >= 0;
    return true;
  },

  // URL validation
  validateUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Sanitize object recursively
  sanitizeObject: (obj: any): any => {
    if (typeof obj === 'string') {
      return inputValidation.sanitizeText(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => inputValidation.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = inputValidation.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }
};

// Form validation schemas
export const reconversionValidation = {
  validateReconversionData: (data: any) => {
    const errors: string[] = [];

    // Company name validation
    if (!data.company_name || !inputValidation.validateCompanyName(data.company_name)) {
      errors.push('Nombre de empresa inválido (2-100 caracteres, solo letras, números y puntuación básica)');
    }

    // Contact name validation
    if (!data.contact_name || data.contact_name.length < 2 || data.contact_name.length > 100) {
      errors.push('Nombre de contacto inválido (2-100 caracteres)');
    }

    // Email validation if provided
    if (data.buyer_contact_email && !inputValidation.validateEmail(data.buyer_contact_email)) {
      errors.push('Email de contacto inválido');
    }

    // Numeric range validation
    if (!inputValidation.validateNumericRange(data.investment_capacity_min, data.investment_capacity_max)) {
      errors.push('Rango de capacidad de inversión inválido');
    }

    if (!inputValidation.validateNumericRange(data.revenue_range_min, data.revenue_range_max)) {
      errors.push('Rango de facturación inválido');
    }

    if (!inputValidation.validateNumericRange(data.ebitda_range_min, data.ebitda_range_max)) {
      errors.push('Rango de EBITDA inválido');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: inputValidation.sanitizeObject(data)
    };
  }
};