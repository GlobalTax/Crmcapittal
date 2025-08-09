// Email and phone validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Check for Spanish phone patterns (9 digits starting with 6,7,8,9 for mobile, or 9 digits starting with 8,9 for landline)
  const spanishMobileRegex = /^[679]\d{8}$/;
  const spanishLandlineRegex = /^[89]\d{8}$/;
  const internationalRegex = /^\d{7,15}$/; // Basic international pattern
  
  return spanishMobileRegex.test(cleanPhone) || 
         spanishLandlineRegex.test(cleanPhone) || 
         internationalRegex.test(cleanPhone);
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const validateFile = (file: File): FileValidationResult => {
  // Basic file validation
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|scr|vbs|js|jar)$/i,
    /[<>:"|?*]/,
    /\0/
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return { valid: false, error: 'Invalid file name or type' };
    }
  }

  // File size limit (50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' };
  }

  return { valid: true };
};