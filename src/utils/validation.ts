/**
 * Sistema de Validación y Sanitización de Entrada
 * 
 * Proporciona funciones para validar y sanitizar datos de entrada,
 * previniendo ataques XSS, SQL injection y otros vectores de ataque.
 */

import { z } from 'zod';

/**
 * Sanitiza una cadena de texto removiendo caracteres peligrosos
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
};

/**
 * Sanitiza un objeto completo
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj } as any;
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    }
  }
  
  return sanitized;
};

/**
 * Valida y sanitiza un email
 */
export const validateEmail = (email: string): { valid: boolean; sanitized?: string } => {
  const emailSchema = z.string().email();
  const result = emailSchema.safeParse(email);
  
  if (result.success) {
    return { valid: true, sanitized: sanitizeString(email.toLowerCase()) };
  }
  
  return { valid: false };
};

/**
 * Valida y sanitiza un teléfono
 */
export const validatePhone = (phone: string): { valid: boolean; sanitized?: string } => {
  // Patrón para teléfonos españoles e internacionales
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  if (phoneRegex.test(cleaned)) {
    return { valid: true, sanitized: cleaned };
  }
  
  return { valid: false };
};

/**
 * Valida y sanitiza un NIF/CIF español
 */
export const validateNIF = (nif: string): { valid: boolean; sanitized?: string } => {
  const nifRegex = /^[0-9A-Z][0-9]{7}[0-9A-Z]$/i;
  const cleaned = nif.toUpperCase().replace(/\s/g, '');
  
  if (nifRegex.test(cleaned)) {
    return { valid: true, sanitized: cleaned };
  }
  
  return { valid: false };
};

/**
 * Valida y sanitiza una URL
 */
export const validateURL = (url: string): { valid: boolean; sanitized?: string } => {
  try {
    const urlSchema = z.string().url();
    const result = urlSchema.safeParse(url);
    
    if (result.success) {
      const sanitized = sanitizeString(url);
      return { valid: true, sanitized };
    }
  } catch {
    // URL inválida
  }
  
  return { valid: false };
};

/**
 * Valida y sanitiza un número
 */
export const validateNumber = (value: any): { valid: boolean; sanitized?: number } => {
  const num = Number(value);
  
  if (!isNaN(num) && isFinite(num)) {
    return { valid: true, sanitized: num };
  }
  
  return { valid: false };
};

/**
 * Valida y sanitiza una fecha
 */
export const validateDate = (date: any): { valid: boolean; sanitized?: string } => {
  try {
    const dateObj = new Date(date);
    
    if (!isNaN(dateObj.getTime())) {
      return { valid: true, sanitized: dateObj.toISOString().split('T')[0] };
    }
  } catch {
    // Fecha inválida
  }
  
  return { valid: false };
};

/**
 * Valida y sanitiza un importe monetario
 */
export const validateAmount = (amount: any): { valid: boolean; sanitized?: number } => {
  const num = Number(amount);
  
  if (!isNaN(num) && isFinite(num) && num >= 0) {
    return { valid: true, sanitized: Math.round(num * 100) / 100 };
  }
  
  return { valid: false };
};

/**
 * Valida y sanitiza un porcentaje
 */
export const validatePercentage = (percentage: any): { valid: boolean; sanitized?: number } => {
  const num = Number(percentage);
  
  if (!isNaN(num) && isFinite(num) && num >= 0 && num <= 100) {
    return { valid: true, sanitized: Math.round(num * 100) / 100 };
  }
  
  return { valid: false };
};

/**
 * Esquemas de validación comunes usando Zod
 */
export const validationSchemas = {
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Teléfono inválido'),
  nif: z.string().regex(/^[0-9A-Z][0-9]{7}[0-9A-Z]$/i, 'NIF/CIF inválido'),
  url: z.string().url('URL inválida'),
  amount: z.number().min(0, 'El importe debe ser positivo'),
  percentage: z.number().min(0).max(100, 'El porcentaje debe estar entre 0 y 100'),
  date: z.string().datetime('Fecha inválida'),
  
  // Esquemas compuestos
  contact: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    company: z.string().optional()
  }),
  
  operation: z.object({
    company_name: z.string().min(2, 'El nombre de la empresa es requerido'),
    amount: z.number().min(0, 'El importe debe ser positivo'),
    operation_type: z.enum(['merger', 'sale', 'partial_sale', 'buy_mandate']),
    status: z.enum(['available', 'pending_review', 'approved', 'rejected', 'in_process', 'sold', 'withdrawn'])
  })
};

/**
 * Valida un objeto usando un esquema Zod
 */
export const validateWithSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { valid: boolean; data?: T; errors?: string[] } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { valid: true, data: result.data };
  }
  
  return {
    valid: false,
    errors: result.error.errors.map(err => err.message)
  };
};

/**
 * Sanitiza y valida datos de formulario
 */
export const sanitizeAndValidate = <T extends Record<string, any>>(
  data: T,
  schema?: z.ZodSchema<T>
): { valid: boolean; data?: T; errors?: string[] } => {
  // Primero sanitizar
  const sanitized = sanitizeObject(data);
  
  // Luego validar si se proporciona un esquema
  if (schema) {
    return validateWithSchema(schema, sanitized);
  }
  
  return { valid: true, data: sanitized };
};

/**
 * Valida un archivo
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo es demasiado grande (máximo 10MB)' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido' };
  }
  
  return { valid: true };
};