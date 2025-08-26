/**
 * Create User Form Component
 * 
 * Focused form component for creating users
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SecureInput } from '@/components/security/SecureInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSecureInput } from '@/hooks/useSecureInput';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { useToast } from '@/hooks/use-toast';
import { CreateUserData, UserRole } from '../services/UserManagementService';
import { validatePasswordStrength, isPasswordStrong } from '../utils/passwordValidation';
import { PhotoUpload } from './PhotoUpload';

interface CreateUserFormProps {
  onSubmit: (data: CreateUserData, photo?: File) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSubmit,
  isSubmitting,
  onCancel
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    role: 'user'
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });

  const { toast } = useToast();
  const { sanitizeInput, validateEmail } = useSecureInput();
  const { logSuspiciousActivity } = useSecurityMonitor();

  const handleSecureEmailChange = (value: string) => {
    try {
      const sanitizedEmail = sanitizeInput(value, { maxLength: 100, allowHtml: false });
      setFormData({ ...formData, email: sanitizedEmail });
    } catch (error) {
      logSuspiciousActivity('malicious_email_input', { input: value, error: String(error) });
      toast({
        title: "Error de Seguridad",
        description: "El email contiene caracteres no válidos",
        variant: "destructive"
      });
    }
  };

  const handleSecurePasswordChange = (value: string) => {
    try {
      if (value.length > 128) {
        logSuspiciousActivity('suspicious_password_length', { length: value.length });
        toast({
          title: "Error",
          description: "Contraseña demasiado larga",
          variant: "destructive"
        });
        return;
      }
      
      setFormData({ ...formData, password: value });
      setPasswordStrength(validatePasswordStrength(value));
    } catch (error) {
      logSuspiciousActivity('password_input_error', { error: String(error) });
    }
  };

  const handleSecureTextChange = (field: keyof CreateUserData, value: string, maxLength: number = 100) => {
    try {
      const sanitized = sanitizeInput(value, { maxLength, allowHtml: false, trimWhitespace: true });
      setFormData({ ...formData, [field]: sanitized });
    } catch (error) {
      logSuspiciousActivity('malicious_text_input', { field, input: value, error: String(error) });
      toast({
        title: "Error de Seguridad",
        description: `Entrada no válida en ${field}`,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Error",
        description: "El formato del email no es válido",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordStrong(formData.password)) {
      toast({
        title: "Error",
        description: "La contraseña no es lo suficientemente segura. Debe incluir mayúsculas, minúsculas, números y símbolos.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData, selectedPhoto || undefined);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score >= 4) return 'text-green-600';
    if (passwordStrength.score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score >= 4) return 'Muy fuerte';
    if (passwordStrength.score >= 3) return 'Fuerte';
    if (passwordStrength.score >= 2) return 'Media';
    return 'Débil';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <SecureInput
          id="email"
          type="email"
          value={formData.email}
          onChange={handleSecureEmailChange}
          placeholder="usuario@ejemplo.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña *</Label>
        <SecureInput
          id="password"
          type="password"
          value={formData.password}
          onChange={handleSecurePasswordChange}
          placeholder="Contraseña segura"
          required
        />
        {formData.password && (
          <div className="text-sm">
            <p className={getPasswordStrengthColor()}>
              Fortaleza: {getPasswordStrengthText()}
            </p>
            {passwordStrength.feedback.length > 0 && (
              <ul className="list-disc list-inside text-red-500 text-xs">
                {passwordStrength.feedback.map((feedback, index) => (
                  <li key={index}>{feedback}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol *</Label>
        <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Usuario</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="superadmin">Super Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <SecureInput
            id="firstName"
            value={formData.firstName || ''}
            onChange={(value) => handleSecureTextChange('firstName', value, 50)}
            placeholder="Nombre"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <SecureInput
            id="lastName"
            value={formData.lastName || ''}
            onChange={(value) => handleSecureTextChange('lastName', value, 50)}
            placeholder="Apellido"
          />
        </div>
      </div>

      {formData.role === 'admin' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="managerName">Nombre del Gestor</Label>
            <SecureInput
              id="managerName"
              value={formData.managerName || ''}
              onChange={(value) => handleSecureTextChange('managerName', value)}
              placeholder="Nombre completo del gestor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerPosition">Cargo del Gestor</Label>
            <SecureInput
              id="managerPosition"
              value={formData.managerPosition || ''}
              onChange={(value) => handleSecureTextChange('managerPosition', value)}
              placeholder="Director, Socio, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerPhone">Teléfono del Gestor</Label>
            <SecureInput
              id="managerPhone"
              value={formData.managerPhone || ''}
              onChange={(value) => handleSecureTextChange('managerPhone', value, 20)}
              placeholder="+34 XXX XXX XXX"
            />
          </div>

          <PhotoUpload
            selectedPhoto={selectedPhoto}
            onPhotoSelect={setSelectedPhoto}
            onClearPhoto={() => setSelectedPhoto(null)}
          />
        </>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </div>
    </form>
  );
};