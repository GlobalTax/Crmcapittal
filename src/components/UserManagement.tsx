import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SecureInput } from "@/components/security/SecureInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSecureInput } from "@/hooks/useSecureInput";
import { useSecurityMonitor } from "@/hooks/useSecurityMonitor";
import { Plus, Trash2, UserCheck, Camera, X, Edit, UserMinus, UserX } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EditUserDialog from "./EditUserDialog";
import UserProjectsList from "./UserProjectsList";
import { User } from "@/hooks/useUsers";

// Interfaz para el EditUserDialog (compatible con su definición interna)
interface EditableUser {
  user_id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  is_manager: boolean;
  manager_name?: string;
  manager_position?: string;
}

type UserRole = 'superadmin' | 'admin' | 'user';

interface DatabaseFunctionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  // Para gestores/admins
  managerName?: string;
  managerPosition?: string;
  managerPhone?: string;
}

// Usar la interfaz User importada desde useUsers

const UserManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    role: 'user'
  });
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sanitizeInput, validateEmail } = useSecureInput();
  const { logSuspiciousActivity } = useSecurityMonitor();

  // Fetch existing users with roles usando la nueva función
  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-roles-complete'],
    queryFn: async () => {
      console.log('Fetching users with roles...');
      try {
        const { data, error } = await supabase
          .rpc('get_users_with_roles');
        
        if (error) {
          console.error('Error fetching users:', error);
          throw error;
        }
        console.log('Users fetched successfully:', data);
        return data;
      } catch (err) {
        console.error('Error in fetchUsers:', err);
        throw err;
      }
    }
  });

  // Enhanced password validation function
  const validatePasswordStrength = (password: string) => {
    const score = calculatePasswordScore(password);
    const feedback = getPasswordFeedback(password);
    setPasswordStrength({ score, feedback });
    return score >= 3; // Require strong password
  };

  const calculatePasswordScore = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 5);
  };

  const getPasswordFeedback = (password: string): string[] => {
    const feedback: string[] = [];
    if (password.length < 8) feedback.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) feedback.push('Al menos una mayúscula');
    if (!/[a-z]/.test(password)) feedback.push('Al menos una minúscula');
    if (!/[0-9]/.test(password)) feedback.push('Al menos un número');
    if (!/[^A-Za-z0-9]/.test(password)) feedback.push('Al menos un símbolo');
    return feedback;
  };

  // Secure input handlers
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
      // Don't sanitize password content, but validate length and patterns
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
      validatePasswordStrength(value);
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

  // Create user mutation with enhanced server-side validation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      console.log('Creating user with data:', userData);
      
      try {
        // Enhanced client-side validation
        if (!validateEmail(userData.email)) {
          throw new Error('Email inválido');
        }

        if (!validatePasswordStrength(userData.password)) {
          throw new Error('La contraseña no cumple con los requisitos de seguridad');
        }

        // Server-side password validation
        const { data: passwordValidation, error: validationError } = await supabase
          .rpc('validate_password_strength', { password: userData.password });

        if (validationError) {
          logSuspiciousActivity('password_validation_bypass_attempt', { error: validationError.message });
          throw new Error('Error validando contraseña en el servidor');
        }

        const validationResult = passwordValidation as { valid?: boolean; errors?: string[] } | null;
        if (!validationResult?.valid) {
          const errors = validationResult?.errors || ['Contraseña no válida'];
          throw new Error(`Contraseña insegura: ${errors.join(', ')}`);
        }

        // Create user via Supabase auth
        console.log('Step 1: Creating auth user...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              first_name: sanitizeInput(userData.firstName || '', { maxLength: 50 }),
              last_name: sanitizeInput(userData.lastName || '', { maxLength: 50 })
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (authError) {
          console.error('Auth error:', authError);
          throw new Error(`Error de autenticación: ${authError.message}`);
        }

        if (!authData.user) {
          throw new Error('No se pudo crear el usuario en el sistema de autenticación');
        }

        console.log('Auth user created:', authData.user.id);

        // Asignar rol
        console.log('Step 2: Assigning role...');
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: userData.role
          });

        if (roleError) {
          console.error('Role error:', roleError);
          throw new Error(`Error asignando rol: ${roleError.message}`);
        }

        console.log('Role assigned successfully');

        // Si es admin, crear también el gestor
        if (userData.role === 'admin' && userData.managerName) {
          console.log('Step 3: Creating manager profile...');
          const { data: managerData, error: managerError } = await supabase
            .from('operation_managers')
            .insert({
              user_id: authData.user.id,
              name: userData.managerName,
              email: userData.email,
              phone: userData.managerPhone,
              position: userData.managerPosition
            })
            .select()
            .single();

          if (managerError) {
            console.error('Manager error:', managerError);
            throw new Error(`Error creando perfil de gestor: ${managerError.message}`);
          }

          console.log('Manager profile created:', managerData);

          // Si hay una foto seleccionada, subirla
          if (selectedPhoto && managerData) {
            try {
              console.log('Step 4: Uploading manager photo...');
              const photoUrl = await uploadManagerPhoto(managerData.id, selectedPhoto);
              
              // Actualizar el gestor con la URL de la foto
              const { error: updateError } = await supabase
                .from('operation_managers')
                .update({ photo: photoUrl })
                .eq('id', managerData.id);

              if (updateError) {
                console.error('Photo update error:', updateError);
                // No lanzamos error aquí porque el gestor ya se creó
              } else {
                console.log('Photo uploaded and linked successfully');
              }
            } catch (photoError) {
              console.error('Error con la foto, pero gestor creado:', photoError);
              // No bloqueamos la creación por errores de foto
            }
          }
        }

        console.log('User creation completed successfully');
        return authData;
      } catch (error) {
        console.error('Error in createUser mutation:', error);
        throw error instanceof Error ? error : new Error('Unknown error occurred');
      }
    },
    onSuccess: () => {
      console.log('User creation mutation succeeded');
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      setIsDialogOpen(false);
      setFormData({ email: '', password: '', role: 'user' });
      setSelectedPhoto(null);
      setPhotoPreview(null);
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-complete'] });
    },
    onError: (error: Error) => {
      console.error('User creation mutation failed:', error);
      let errorMessage = "Error al crear el usuario";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Remove user role mutation
  const removeUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      console.log('Removing user role for:', userId, 'role:', role);
      const { data, error } = await supabase
        .rpc('remove_user_role', {
          _user_id: userId,
          _role: role
        });

      if (error) {
        console.error('Remove role error:', error);
        throw error;
      }

      const result = data as unknown as DatabaseFunctionResponse;
      if (result && !result.success) {
        throw new Error(result.error || 'Error al remover rol');
      }

      return result;
    },
    onSuccess: (data: DatabaseFunctionResponse) => {
      toast({
        title: "Rol removido",
        description: data?.message || "El rol del usuario ha sido removido",
      });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-complete'] });
    },
    onError: (error: Error) => {
      console.error('Remove role mutation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Error al remover el rol",
        variant: "destructive",
      });
    },
  });

  // Delete user completely mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting user completely:', userId);
      const { data, error } = await supabase
        .rpc('delete_user_completely', {
          _user_id: userId
        });

      if (error) {
        console.error('Delete user error:', error);
        throw error;
      }

      const result = data as unknown as DatabaseFunctionResponse;
      if (result && !result.success) {
        throw new Error(result.error || 'Error al eliminar usuario');
      }

      return result;
    },
    onSuccess: (data: DatabaseFunctionResponse) => {
      toast({
        title: "Usuario eliminado",
        description: data?.message || "El usuario ha sido eliminado completamente del sistema",
      });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-complete'] });
    },
    onError: (error: Error) => {
      console.error('Delete user mutation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el usuario",
        variant: "destructive",
      });
    },
  });

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedPhoto(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  const uploadManagerPhoto = async (managerId: string, photoFile: File) => {
    try {
      console.log('Uploading photo for manager:', managerId);
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${managerId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('manager-photos')
        .upload(fileName, photoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('manager-photos')
        .getPublicUrl(fileName);

      console.log('Photo uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (err) {
      console.error('Error subiendo foto:', err);
      throw err;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Enhanced client-side validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      toast({
        title: "Error",
        description: "El formato del email no es válido",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    if (passwordStrength.score < 3) {
      toast({
        title: "Error",
        description: "La contraseña no es lo suficientemente segura. Debe incluir mayúsculas, minúsculas, números y símbolos.",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === 'admin' && !formData.managerName) {
      toast({
        title: "Error",
        description: "Los administradores necesitan un nombre de gestor",
        variant: "destructive",
      });
      return;
    }

    // Log form submission for security monitoring
    logSuspiciousActivity('user_creation_attempt', {
      role: formData.role,
      email: formData.email,
      hasManagerData: !!formData.managerName
    }).catch(console.error);

    createUserMutation.mutate(formData);
  };

  const handleRemoveUserRole = (userId: string, role: UserRole) => {
    removeUserRoleMutation.mutate({ userId, role });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleEditUser = (user: User) => {
    // Convertir User de useUsers a EditableUser para el dialog
    const editableUser: EditableUser = {
      user_id: user.user_id,
      email: user.email,
      role: user.role as UserRole,
      first_name: user.first_name,
      last_name: user.last_name,
      is_manager: user.is_manager,
      manager_name: undefined, // No disponible en la nueva interfaz
      manager_position: undefined // No disponible en la nueva interfaz
    };
    setEditingUser(editableUser);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', role: 'user' });
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Gestión de Usuarios</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Complete el formulario para crear un nuevo usuario en el sistema.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <SecureInput
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleSecureEmailChange}
                  placeholder="usuario@ejemplo.com"
                  required
                  enableSanitization={true}
                  maxLength={100}
                  allowedChars={/^[a-zA-Z0-9@._-]*$/}
                  errorMessage="Email inválido o contiene caracteres no permitidos"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <SecureInput
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleSecurePasswordChange}
                  placeholder="Mínimo 8 caracteres, incluye mayúsculas, números y símbolos"
                  required
                  enableSanitization={false}
                  maxLength={128}
                  showPasswordStrength={true}
                  errorMessage={passwordStrength.feedback.length > 0 ? passwordStrength.feedback.join(', ') : undefined}
                />
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            passwordStrength.score >= level
                              ? level <= 2 ? 'bg-red-500' : level <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      passwordStrength.score <= 2 ? 'text-red-600' : 
                      passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      Fortaleza: {
                        passwordStrength.score <= 1 ? 'Muy débil' :
                        passwordStrength.score <= 2 ? 'Débil' :
                        passwordStrength.score <= 3 ? 'Media' :
                        passwordStrength.score <= 4 ? 'Fuerte' : 'Muy fuerte'
                      }
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="role">Rol *</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador/Gestor</SelectItem>
                    <SelectItem value="superadmin">Superadministrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'admin' && (
                <>
                  <div>
                    <Label htmlFor="managerName">Nombre del Gestor *</Label>
                    <SecureInput
                      id="managerName"
                      value={formData.managerName || ''}
                      onChange={(value) => handleSecureTextChange('managerName', value, 100)}
                      placeholder="Nombre completo del gestor"
                      required
                      enableSanitization={true}
                      maxLength={100}
                      allowedChars={/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.-]*$/}
                      errorMessage="Solo se permiten letras, espacios, puntos y guiones"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="managerPosition">Posición</Label>
                    <SecureInput
                      id="managerPosition"
                      value={formData.managerPosition || ''}
                      onChange={(value) => handleSecureTextChange('managerPosition', value, 50)}
                      placeholder="Director, Gerente, etc."
                      enableSanitization={true}
                      maxLength={50}
                      allowedChars={/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.-]*$/}
                      errorMessage="Solo se permiten letras, espacios, puntos y guiones"
                    />
                  </div>

                  <div>
                    <Label htmlFor="managerPhone">Teléfono</Label>
                    <SecureInput
                      id="managerPhone"
                      value={formData.managerPhone || ''}
                      onChange={(value) => handleSecureTextChange('managerPhone', value, 20)}
                      placeholder="+34 600 000 000"
                      enableSanitization={true}
                      maxLength={20}
                      allowedChars={/^[+0-9\s()-]*$/}
                      errorMessage="Solo se permiten números, espacios, +, - y paréntesis"
                    />
                  </div>

                  {/* Foto del gestor */}
                  <div>
                    <Label>Foto del Gestor</Label>
                    <div className="flex flex-col items-center space-y-3 mt-2">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={photoPreview || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {formData.managerName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'GM'}
                          </AvatarFallback>
                        </Avatar>
                        
                        {photoPreview && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
                            onClick={clearPhoto}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="relative overflow-hidden"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Camera className="h-4 w-4 mr-2" />
                        {selectedPhoto ? 'Cambiar foto' : 'Seleccionar foto'}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creando..." : "Crear Usuario"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-black overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Información</TableHead>
              <TableHead>Proyectos</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {user.is_manager && (
                        <span className="flex items-center gap-1 text-xs">
                          <UserCheck className="h-3 w-3" />
                          Gestor
                        </span>
                      )}
                      {!user.is_manager && user.role !== 'superadmin' && (
                        <span className="text-xs text-gray-500">Usuario</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                     {user.is_manager && (
                        <div>
                          <div className="font-medium">Gestor</div>
                          <div className="text-gray-500">Rol administrativo</div>
                        </div>
                      )}
                      {user.first_name && user.last_name && (
                        <div>{user.first_name} {user.last_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserProjectsList 
                      userId={user.user_id}
                      userName={`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}
                      isManager={user.is_manager}
                    />
                  </TableCell>
                   <TableCell>
                     <div className="flex items-center gap-2">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => handleEditUser(user)}
                         className="text-blue-600 hover:text-blue-800"
                         title="Editar usuario"
                       >
                         <Edit className="h-4 w-4" />
                       </Button>
                       
                       {/* Remover Rol */}
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="text-orange-600 hover:text-orange-800"
                             title="Remover rol (mantener usuario)"
                           >
                             <UserMinus className="h-4 w-4" />
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>¿Remover rol de usuario?</AlertDialogTitle>
                             <AlertDialogDescription>
                               Esta acción removerá el rol "{user.role}" del usuario {user.email}. 
                               El usuario permanecerá en el sistema pero perderá los permisos asociados a este rol.
                               {user.role === 'admin' && ' También se eliminará su perfil de gestor si lo tiene.'}
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveUserRole(user.user_id, user.role as UserRole)}
                                className="bg-orange-600 hover:bg-orange-700"
                                disabled={removeUserRoleMutation.isPending}
                              >
                               {removeUserRoleMutation.isPending ? "Removiendo..." : "Remover Rol"}
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>

                       {/* Eliminar Usuario Completo */}
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="text-red-600 hover:text-red-800"
                             title="Eliminar usuario completamente"
                           >
                             <UserX className="h-4 w-4" />
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>¿Eliminar usuario completamente?</AlertDialogTitle>
                             <AlertDialogDescription className="space-y-2">
                               <div className="text-red-600 font-medium">
                                 ⚠️ ATENCIÓN: Esta es una acción irreversible
                               </div>
                               <div>
                                 Esta acción eliminará completamente al usuario {user.email} del sistema, incluyendo:
                               </div>
                               <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                                 <li>Su cuenta de autenticación</li>
                                 <li>Todos sus roles y permisos</li>
                                 <li>Su perfil de usuario</li>
                                 {user.is_manager && <li>Su perfil de gestor</li>}
                                 <li>Historial de actividades asociadas</li>
                               </ul>
                               <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                 <strong>El usuario no podrá volver a acceder al sistema.</strong>
                               </div>
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancelar</AlertDialogCancel>
                             <AlertDialogAction
                               onClick={() => handleDeleteUser(user.user_id)}
                               className="bg-red-600 hover:bg-red-700"
                               disabled={deleteUserMutation.isPending}
                             >
                               {deleteUserMutation.isPending ? "Eliminando..." : "Eliminar Usuario"}
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </div>
                   </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-black">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EditUserDialog 
        user={editingUser}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingUser(null);
        }}
      />
    </div>
  );
};

export default UserManagement;
