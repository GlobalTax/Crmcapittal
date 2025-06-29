
import { useState } from "react";
import { TargetCompany, TargetContact, CreateTargetContactData } from "@/types/TargetCompany";
import { useTargetCompanies } from "@/hooks/useTargetCompanies";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ExternalLink, 
  User, 
  Plus, 
  Mail, 
  Linkedin, 
  Edit2, 
  Trash2,
  Star,
  Building,
  Euro
} from "lucide-react";
import { CreateContactDialog } from "./CreateContactDialog";

interface TargetCompanyDetailsDialogProps {
  target: TargetCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  'IDENTIFIED': 'bg-gray-100 text-gray-800',
  'RESEARCHING': 'bg-blue-100 text-blue-800',
  'OUTREACH_PLANNED': 'bg-yellow-100 text-yellow-800',
  'CONTACTED': 'bg-orange-100 text-orange-800',
  'IN_CONVERSATION': 'bg-green-100 text-green-800',
  'ON_HOLD': 'bg-red-100 text-red-800',
  'ARCHIVED': 'bg-gray-100 text-gray-600',
  'CONVERTED_TO_DEAL': 'bg-purple-100 text-purple-800'
};

const statusLabels: Record<string, string> = {
  'IDENTIFIED': 'Identificado',
  'RESEARCHING': 'Investigando',
  'OUTREACH_PLANNED': 'Contacto Planificado',
  'CONTACTED': 'Contactado',
  'IN_CONVERSATION': 'En Conversación',
  'ON_HOLD': 'En Pausa',
  'ARCHIVED': 'Archivado',
  'CONVERTED_TO_DEAL': 'Convertido a Deal'
};

export const TargetCompanyDetailsDialog = ({ target, open, onOpenChange }: TargetCompanyDetailsDialogProps) => {
  const { deleteTargetContact } = useTargetCompanies();
  const [showCreateContact, setShowCreateContact] = useState(false);

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      await deleteTargetContact(contactId);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {target.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={statusColors[target.status]}>
                    {statusLabels[target.status]}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Sector</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{target.industry || 'No especificado'}</p>
                </CardContent>
              </Card>

              {target.fit_score && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Fit Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < target.fit_score! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm">{target.fit_score}/5</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {target.revenue && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      Ingresos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">€{(target.revenue / 1000000).toFixed(1)}M</p>
                  </CardContent>
                </Card>
              )}

              {target.ebitda && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">EBITDA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">€{(target.ebitda / 1000000).toFixed(1)}M</p>
                  </CardContent>
                </Card>
              )}

              {target.website && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Website</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href={target.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {target.website}
                    </a>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Description */}
            {target.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{target.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Investment Thesis */}
            {target.investment_thesis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tesis de Inversión</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{target.investment_thesis}</p>
                </CardContent>
              </Card>
            )}

            {/* Source Notes */}
            {target.source_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notas de Origen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{target.source_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Contacts Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contactos Clave ({target.contacts?.length || 0})
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateContact(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Añadir Contacto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {target.contacts && target.contacts.length > 0 ? (
                  <div className="space-y-3">
                    {target.contacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{contact.name}</div>
                          {contact.title && (
                            <div className="text-sm text-gray-600">{contact.title}</div>
                          )}
                          <div className="flex items-center gap-4 mt-1">
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </a>
                            )}
                            {contact.linkedin_url && (
                              <a
                                href={contact.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Linkedin className="h-3 w-3" />
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay contactos registrados para esta empresa.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Contact Dialog */}
      <CreateContactDialog
        targetCompanyId={target.id}
        open={showCreateContact}
        onOpenChange={setShowCreateContact}
      />
    </>
  );
};
