
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type UserRole = 'superadmin' | 'admin' | 'user';

interface User {
  user_id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  is_manager: boolean;
  manager_name?: string;
  manager_position?: string;
}

interface EditUserData {
  role: UserRole;
  managerName?: string;
  managerPosition?: string;
  managerPhone?: string;
}

interface RoleUpdateResult {
  success: boolean;
  error?: string;
  message?: string;
}

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditUserDialog = ({ user, isOpen, onClose }: EditUserDialogProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditUserData>({
    role: 'user'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role,
        managerName: user.manager_name || '',
        managerPosition: user.manager_position || '',
        managerPhone: ''
      });
      setSelectedPhoto(null);
      setPhotoPreview(null);
      
      // Fetch current manager photo if exists
      if (user.is_manager) {
        fetchManagerPhoto(user.user_id);
      }
    }
  }, [user]);

  const fetchManagerPhoto = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('operation_managers')
        .select('photo')
        .eq('user_id', userId)
        .single();

      if (error) {
        return;
      }

      setCurrentPhoto(data?.photo || null);
    } catch (err) {
      // Silent error handling for photo fetch
    }
  };

  const updateUserMutation = useMutation({
    mutationFn: async (userData: EditUserData) => {
      if (!user) throw new Error('No user selected');

      try {
        // Update user role using secure function
        const { data: roleResult, error: roleError } = await supabase.rpc(
          'update_user_role_secure',
          {
            _target_user_id: user.user_id,
            _new_role: userData.role
          }
        );

        if (roleError) {
          throw new Error(`Error actualizando rol: ${roleError.message}`);
        }

        if (roleResult && typeof roleResult === 'object' && roleResult !== null) {
          const result = roleResult as { success?: boolean; error?: string };
          if (!result.success) {
            throw new Error(result.error || 'Error al actualizar rol');
          }
        }

        // Handle manager profile based on new role
        if (userData.role === 'admin') {
          // Check if manager profile exists
          const { data: existingManager, error: checkError } = await supabase
            .from('operation_managers')
            .select('id')
            .eq('user_id', user.user_id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            throw new Error(`Error verificando gestor: ${checkError.message}`);
          }

          if (existingManager) {
            // Update existing manager
            const updateData: Partial<{
              name: string;
              position: string;
              phone: string;
            }> = {};
            if (userData.managerName) updateData.name = userData.managerName;
            if (userData.managerPosition) updateData.position = userData.managerPosition;
            if (userData.managerPhone) updateData.phone = userData.managerPhone;

            const { error: updateError } = await supabase
              .from('operation_managers')
              .update(updateData)
              .eq('id', existingManager.id);

            if (updateError) {
              throw new Error(`Error actualizando gestor: ${updateError.message}`);
            }

            // Handle photo upload
            if (selectedPhoto) {
              const photoUrl = await uploadManagerPhoto(existingManager.id, selectedPhoto);
              const { error: photoError } = await supabase
                .from('operation_managers')
                .update({ photo: photoUrl })
                .eq('id', existingManager.id);

              if (photoError) {
                // Photo upload failed but continue
              }
            }
          } else {
            // Create new manager profile
            const { data: newManager, error: createError } = await supabase
              .from('operation_managers')
              .insert({
                user_id: user.user_id,
                name: userData.managerName || user.email,
                email: user.email,
                phone: userData.managerPhone,
                position: userData.managerPosition
              })
              .select()
              .single();

            if (createError) {
              throw new Error(`Error creando gestor: ${createError.message}`);
            }

            // Handle photo upload for new manager
            if (selectedPhoto && newManager) {
              const photoUrl = await uploadManagerPhoto(newManager.id, selectedPhoto);
              const { error: photoError } = await supabase
                .from('operation_managers')
                .update({ photo: photoUrl })
                .eq('id', newManager.id);

              if (photoError) {
                // Photo upload failed but continue
              }
            }
          }
        } else {
          // If new role is NOT admin and user currently IS a manager, remove manager profile
          if (user.is_manager) {
            const { error: deleteError } = await supabase
              .from('operation_managers')
              .delete()
              .eq('user_id', user.user_id);

            if (deleteError) {
              throw new Error(`Error eliminando gestor: ${deleteError.message}`);
            }
          }
        }

        return true;
      } catch (error) {
        throw error instanceof Error ? error : new Error('Unknown error occurred');
      }
    },
    onSuccess: () => {
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-complete'] });
    },
    onError: (error: Error) => {
      let errorMessage = "Error al actualizar el usuario";
      
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
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${managerId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('manager-photos')
        .upload(fileName, photoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('manager-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      throw err;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.role === 'admin' && !formData.managerName) {
      toast({
        title: "Error",
        description: "Los administradores necesitan un nombre de gestor",
        variant: "destructive",
      });
      return;
    }

    updateUserMutation.mutate(formData);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifique el rol del usuario y configure su perfil de gestor si es necesario. Los administradores requieren información adicional.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={user.email} disabled className="bg-gray-100" />
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
                <Input
                  id="managerName"
                  value={formData.managerName || ''}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="Nombre completo del gestor"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="managerPosition">Posición</Label>
                <Input
                  id="managerPosition"
                  value={formData.managerPosition || ''}
                  onChange={(e) => setFormData({ ...formData, managerPosition: e.target.value })}
                  placeholder="Director, Gerente, etc."
                />
              </div>

              <div>
                <Label htmlFor="managerPhone">Teléfono</Label>
                <Input
                  id="managerPhone"
                  value={formData.managerPhone || ''}
                  onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>

              {/* Foto del gestor */}
              <div>
                <Label>Foto del Gestor</Label>
                <div className="flex flex-col items-center space-y-3 mt-2">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={photoPreview || currentPhoto || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {formData.managerName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'GM'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {(photoPreview || selectedPhoto) && (
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
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
                    variant="secondary"
                    className="relative overflow-hidden"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Camera className="h-4 w-4 mr-2" />
                    {selectedPhoto ? 'Cambiar foto' : currentPhoto ? 'Actualizar foto' : 'Seleccionar foto'}
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? "Actualizando..." : "Actualizar Usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
