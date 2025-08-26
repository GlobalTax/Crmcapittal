import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAllPermissions, useRolePermissions, PERMISSIONS } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Search, Shield, Users, Settings, BarChart3, Building2, Contact, TrendingUp, DollarSign } from 'lucide-react';

const ROLES = [
  { key: 'superadmin', label: 'Super Administrador', color: 'bg-red-500', icon: Shield },
  { key: 'admin', label: 'Administrador', color: 'bg-orange-500', icon: Settings },
  { key: 'user', label: 'Usuario', color: 'bg-gray-500', icon: Users },
] as const;

const MODULE_ICONS = {
  companies: Building2,
  contacts: Contact,
  leads: TrendingUp,
  operations: BarChart3,
  commissions: DollarSign,
  users: Users,
  system: Settings,
};

const MODULE_COLORS = {
  companies: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  contacts: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  leads: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  operations: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  commissions: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  users: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
  system: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

export default function RolePermissionMatrix() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const { data: permissions = [] } = useAllPermissions();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Filtrar permisos
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === 'all' || permission.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  // Agrupar por módulos
  const permissionsByModule = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  // Función para actualizar permisos de rol
  const updateRolePermission = async (role: string, permissionId: string, hasPermission: boolean) => {
    try {
      if (hasPermission) {
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role: role as any, permission_id: permissionId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role', role as any)
          .eq('permission_id', permissionId);
        if (error) throw error;
      }

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      
      toast({
        title: 'Permisos actualizados',
        description: `Permisos del rol ${role} actualizados correctamente.`,
      });
    } catch (error) {
      // Error updating role permission
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar los permisos.',
        variant: 'destructive',
      });
    }
  };

  const modules = [...new Set(permissions.map(p => p.module))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar permisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">Todos los módulos</option>
            {modules.map(module => (
              <option key={module} value={module}>
                {module.charAt(0).toUpperCase() + module.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Matriz de Permisos</TabsTrigger>
          <TabsTrigger value="roles">Gestión por Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Matriz de Permisos por Rol
              </CardTitle>
              <CardDescription>
                Gestiona qué permisos tiene cada rol en el sistema. Los cambios se guardan automáticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(permissionsByModule).map(([module, modulePermissions]) => {
                  const ModuleIcon = MODULE_ICONS[module as keyof typeof MODULE_ICONS] || Settings;
                  
                  return (
                    <div key={module} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <ModuleIcon className="h-5 w-5" />
                        <h3 className="font-semibold capitalize">{module}</h3>
                        <Badge variant="outline" className={MODULE_COLORS[module as keyof typeof MODULE_COLORS]}>
                          {modulePermissions.length} permisos
                        </Badge>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium">Permiso</th>
                              {ROLES.map(role => {
                                const Icon = role.icon;
                                return (
                                  <th key={role.key} className="text-center p-2 min-w-[100px]">
                                    <div className="flex flex-col items-center gap-1">
                                      <Icon className="h-4 w-4" />
                                      <span className="text-xs font-medium">{role.label}</span>
                                    </div>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {modulePermissions.map(permission => (
                              <PermissionRow 
                                key={permission.id}
                                permission={permission}
                                roles={ROLES}
                                onUpdatePermission={updateRolePermission}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map(role => (
              <RoleCard key={role.key} role={role} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente para cada fila de permiso
function PermissionRow({ 
  permission, 
  roles, 
  onUpdatePermission 
}: { 
  permission: any;
  roles: typeof ROLES;
  onUpdatePermission: (role: string, permissionId: string, hasPermission: boolean) => void;
}) {
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-2">
        <div>
          <div className="font-medium">{permission.description || permission.name}</div>
          <div className="text-xs text-muted-foreground">{permission.name}</div>
        </div>
      </td>
      {roles.map(role => (
        <td key={role.key} className="p-2 text-center">
          <RolePermissionCheckbox
            role={role.key}
            permissionId={permission.id}
            onUpdate={onUpdatePermission}
          />
        </td>
      ))}
    </tr>
  );
}

// Componente para checkbox de permisos por rol
function RolePermissionCheckbox({ 
  role, 
  permissionId, 
  onUpdate 
}: { 
  role: string;
  permissionId: string;
  onUpdate: (role: string, permissionId: string, hasPermission: boolean) => void;
}) {
  const { data: rolePermissions = [] } = useRolePermissions(role);
  const hasPermission = rolePermissions.some(rp => rp.permission_id === permissionId);

  return (
    <Checkbox
      checked={hasPermission}
      onCheckedChange={(checked) => onUpdate(role, permissionId, !!checked)}
    />
  );
}

// Componente para tarjeta de rol
function RoleCard({ role }: { role: any }) {
  const { data: rolePermissions = [] } = useRolePermissions(role.key);
  const Icon = role.icon;

  const permissionsByModule = rolePermissions.reduce((acc, rp) => {
    const module = rp.permissions.module;
    if (!acc[module]) acc[module] = 0;
    acc[module]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${role.color} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{role.label}</CardTitle>
            <CardDescription>{rolePermissions.length} permisos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(permissionsByModule).map(([module, count]) => {
          const ModuleIcon = MODULE_ICONS[module as keyof typeof MODULE_ICONS] || Settings;
          return (
            <div key={module} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ModuleIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm capitalize">{module}</span>
              </div>
              <Badge variant="secondary">{count}</Badge>
            </div>
          );
        })}
        {Object.keys(permissionsByModule).length === 0 && (
          <p className="text-sm text-muted-foreground">Sin permisos asignados</p>
        )}
      </CardContent>
    </Card>
  );
}