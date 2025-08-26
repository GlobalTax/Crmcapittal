/**
 * Password Validation Utilities
 * 
 * Client-side password validation and strength calculation
 */

export interface PasswordStrength {
  score: number;
  feedback: string[];
}

export const calculatePasswordScore = (password: string): number => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 5);
};

export const getPasswordFeedback = (password: string): string[] => {
  const feedback: string[] = [];
  if (password.length < 8) feedback.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) feedback.push('Al menos una mayúscula');
  if (!/[a-z]/.test(password)) feedback.push('Al menos una minúscula');
  if (!/[0-9]/.test(password)) feedback.push('Al menos un número');
  if (!/[^A-Za-z0-9]/.test(password)) feedback.push('Al menos un símbolo');
  return feedback;
};

export const validatePasswordStrength = (password: string): PasswordStrength => {
  const score = calculatePasswordScore(password);
  const feedback = getPasswordFeedback(password);
  return { score, feedback };
};

export const isPasswordStrong = (password: string): boolean => {
  return calculatePasswordScore(password) >= 3;
};