
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, UserCheck } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type UserRole = 'superadmin' | 'admin' | 'user';

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

const UserManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    role: 'user'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing users with roles usando la nueva función
  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-roles-complete'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_users_with_roles');
      
      if (error) throw error;
      return data;
    }
  });

  // Create user mutation actualizada
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      // Create user via Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Asignar rol
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: userData.role
          });

        if (roleError) throw roleError;

        // Si es admin, crear también el gestor
        if (userData.role === 'admin' && userData.managerName) {
          const { error: managerError } = await supabase
            .from('operation_managers')
            .insert({
              user_id: authData.user.id,
              name: userData.managerName,
              email: userData.email,
              phone: userData.managerPhone,
              position: userData.managerPosition
            });

          if (managerError) throw managerError;
        }
      }

      return authData;
    },
    onSuccess: () => {
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      setIsDialogOpen(false);
      setFormData({ email: '', password: '', role: 'user' });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-complete'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear el usuario",
        variant: "destructive",
      });
    },
  });

  // Delete user role mutation
  const deleteUserRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Rol eliminado",
        description: "El rol del usuario ha sido eliminado",
      });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles-complete'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el rol",
        variant: "destructive",
      });
    },
  });

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

    if (formData.role === 'admin' && !formData.managerName) {
      toast({
        title: "Error",
        description: "Los administradores necesitan un nombre de gestor",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(formData);
  };

  const handleDeleteUserRole = (userId: string) => {
    deleteUserRoleMutation.mutate(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-black">Gestión de Usuarios</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
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

      <div className="bg-white rounded-xl shadow-sm border border-black overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Información</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
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
                      {user.is_manager && user.manager_name && (
                        <div>
                          <div className="font-medium">{user.manager_name}</div>
                          {user.manager_position && (
                            <div className="text-gray-500">{user.manager_position}</div>
                          )}
                        </div>
                      )}
                      {user.first_name && user.last_name && (
                        <div>{user.first_name} {user.last_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar rol de usuario?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará el rol del usuario. El usuario no podrá acceder a las funciones administrativas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUserRole(user.user_id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar Rol
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-black">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;
