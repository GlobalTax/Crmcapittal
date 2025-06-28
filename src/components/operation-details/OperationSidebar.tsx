
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, User, Mail, Phone, Download } from "lucide-react";
import { Operation } from "@/types/Operation";
import { getStatusLabel, getStatusColor } from "@/utils/operationHelpers";

interface OperationSidebarProps {
  operation: Operation;
}

export const OperationSidebar = ({ operation }: OperationSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Status & Date */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Estado y Fechas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Estado</label>
            <div className="mt-1">
              <Badge className={getStatusColor(operation.status)}>
                {getStatusLabel(operation.status)}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Fecha de Operación</label>
            <p className="text-sm">{new Date(operation.date).toLocaleDateString('es-ES')}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
            <p className="text-sm">{new Date(operation.created_at).toLocaleDateString('es-ES')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Manager */}
      {operation.manager && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Gestor Asignado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={operation.manager.photo} 
                  alt={operation.manager.name}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {operation.manager.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{operation.manager.name}</p>
                {operation.manager.position && (
                  <p className="text-sm text-gray-600">{operation.manager.position}</p>
                )}
              </div>
            </div>
            {operation.manager.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${operation.manager.email}`} className="text-blue-600 hover:underline">
                  {operation.manager.email}
                </a>
              </div>
            )}
            {operation.manager.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <a href={`tel:${operation.manager.phone}`} className="text-blue-600 hover:underline">
                  {operation.manager.phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Teaser */}
      {operation.teaser_url && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(operation.teaser_url, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Teaser
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
