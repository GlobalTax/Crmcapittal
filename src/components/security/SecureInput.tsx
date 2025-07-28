import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecureInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  showPasswordStrength?: boolean;
  enableSanitization?: boolean;
  maxLength?: number;
  allowedChars?: RegExp;
  errorMessage?: string;
}

// Comprehensive input sanitization
const sanitizeInput = (input: string, allowedChars?: RegExp): string => {
  let sanitized = input;
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove SQL injection patterns
  sanitized = sanitized.replace(/['"`;\\]/g, '');
  
  // Remove script tags and event handlers
  sanitized = sanitized.replace(/(script|javascript|vbscript|onload|onerror|onclick)/gi, '');
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Apply custom character restrictions
  if (allowedChars) {
    sanitized = sanitized.replace(new RegExp(`[^${allowedChars.source}]`, 'g'), '');
  }
  
  return sanitized;
};

// Password strength calculation
const calculatePasswordStrength = (password: string): { score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 20;
  else feedback.push('Mínimo 8 caracteres');
  
  if (password.length >= 12) score += 10;
  else if (password.length >= 8) feedback.push('Mejor con 12+ caracteres');
  
  if (/[A-Z]/.test(password)) score += 20;
  else feedback.push('Incluye mayúsculas');
  
  if (/[a-z]/.test(password)) score += 20;
  else feedback.push('Incluye minúsculas');
  
  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Incluye números');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
  else feedback.push('Incluye símbolos especiales');
  
  return { score, feedback };
};

const getStrengthColor = (score: number): string => {
  if (score < 40) return 'bg-red-500';
  if (score < 70) return 'bg-yellow-500';
  if (score < 90) return 'bg-blue-500';
  return 'bg-green-500';
};

const getStrengthText = (score: number): string => {
  if (score < 40) return 'Débil';
  if (score < 70) return 'Regular';
  if (score < 90) return 'Buena';
  return 'Muy fuerte';
};

export function SecureInput({
  label,
  value,
  onChange,
  type = 'text',
  showPasswordStrength = false,
  enableSanitization = true,
  maxLength,
  allowedChars,
  errorMessage,
  className,
  ...props
}: SecureInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Apply maxLength
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    
    // Apply sanitization
    if (enableSanitization) {
      newValue = sanitizeInput(newValue, allowedChars);
    }
    
    onChange(newValue);
  }, [onChange, maxLength, enableSanitization, allowedChars]);
  
  const passwordStrength = isPassword && showPasswordStrength ? calculatePasswordStrength(value) : null;
  
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className="flex items-center gap-2">
          {enableSanitization && <Shield className="h-3 w-3 text-green-600" />}
          {label}
        </Label>
      )}
      
      <div className="relative">
        <Input
          {...props}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'pr-10',
            errorMessage && 'border-red-500 focus:border-red-500',
            className
          )}
        />
        
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}
      
      {/* Character count */}
      {maxLength && (
        <div className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </div>
      )}
      
      {/* Password strength indicator */}
      {passwordStrength && isFocused && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  getStrengthColor(passwordStrength.score)
                )}
                style={{ width: `${passwordStrength.score}%` }}
              />
            </div>
            <span className="text-xs font-medium">
              {getStrengthText(passwordStrength.score)}
            </span>
          </div>
          
          {passwordStrength.feedback.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">Para mejorar la contraseña:</div>
              <ul className="list-disc list-inside space-y-1">
                {passwordStrength.feedback.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Security features indicator */}
      {enableSanitization && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Input protegido contra inyección y scripts maliciosos
        </div>
      )}
    </div>
  );
}