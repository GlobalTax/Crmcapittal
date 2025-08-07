import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDocumentPermissions } from '@/hooks/useDocumentPermissions';
import { AddPermissionDialog } from './AddPermissionDialog';
import { Users, Shield, Clock, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PermissionManagerProps {
  documentId: string;
}

const getPermissionColor = (type: string) => {
  switch (type) {
    case 'owner': return 'bg-red-100 text-red-800';
    case 'editor': return 'bg-blue-100 text-blue-800';
    case 'viewer': return 'bg-green-100 text-green-800';
    case 'commenter': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPermissionIcon = (type: string) => {
  switch (type) {
    case 'owner': return <Shield className="h-4 w-4" />;
    case 'editor': return <Users className="h-4 w-4" />;
    default: return <Users className="h-4 w-4" />;
  }
};

export const PermissionManager: React.FC<PermissionManagerProps> = ({ documentId }) => {
  const { permissions, loading, revokePermission } = useDocumentPermissions(documentId);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleRevokePermission = async (permissionId: string) => {
    await revokePermission(permissionId);
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permisos del Documento
            </CardTitle>
            <CardDescription>
              Gestiona quién puede acceder y editar este documento
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            Agregar Permiso
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando permisos...
            </div>
          ) : permissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay permisos adicionales configurados
            </div>
          ) : (
            permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getPermissionIcon(permission.permission_type)}
                  <div>
                    <div className="font-medium">
                      {/* TODO: Mostrar nombre del usuario/equipo */}
                      {permission.user_id ? 'Usuario' : 'Equipo'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Otorgado {new Date(permission.granted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getPermissionColor(permission.permission_type)}>
                    {permission.permission_type}
                  </Badge>
                  
                  {permission.expires_at && (
                    <Badge variant={isExpired(permission.expires_at) ? "destructive" : "secondary"}>
                      <Clock className="h-3 w-3 mr-1" />
                      {isExpired(permission.expires_at) ? 'Expirado' : 'Expira'}
                    </Badge>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Revocar permiso?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. El usuario perderá acceso al documento.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRevokePermission(permission.id)}>
                          Revocar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>

        <AddPermissionDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          documentId={documentId}
        />
      </CardContent>
    </Card>
  );
};