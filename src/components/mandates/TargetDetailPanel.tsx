import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  TrendingUp, 
  Brain, 
  FileText, 
  Calendar,
  Edit,
  ExternalLink
} from 'lucide-react';
import { MandateTarget, MandateDocument } from '@/types/BuyingMandate';
import { useTargetDetail } from '@/hooks/useTargetDetail';
import { TargetHeader } from './target-detail/TargetHeader';
import { TargetContactSection } from './target-detail/TargetContactSection';
import { TargetFinancialSection } from './target-detail/TargetFinancialSection';
import { TargetEInformaSection } from './target-detail/TargetEInformaSection';
import { TargetDocumentsSection } from './target-detail/TargetDocumentsSection';
import { TargetActivityTimeline } from './target-detail/TargetActivityTimeline';
import { TargetQuickActions } from './target-detail/TargetQuickActions';
import { ContactHistorySection } from './target-detail/ContactHistorySection';

interface TargetDetailPanelProps {
  target: MandateTarget | null;
  documents: MandateDocument[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTargetUpdate: (target: MandateTarget) => void;
  onDocumentUploaded: () => void;
}

export const TargetDetailPanel = ({
  target,
  documents,
  open,
  onOpenChange,
  onTargetUpdate,
  onDocumentUploaded
}: TargetDetailPanelProps) => {
  const {
    activities,
    enrichments,
    followups,
    isLoading,
    fetchAllData,
    addActivity,
    addFollowup,
    completeFollowup,
    enrichWithEInforma,
    generateNDA,
  } = useTargetDetail(target?.id || '');

  useEffect(() => {
    if (target?.id && open) {
      fetchAllData();
    }
  }, [target?.id, open, fetchAllData]);

  if (!target) return null;

  const targetDocuments = documents.filter(doc => doc.target_id === target.id);
  const latestEnrichment = enrichments[0];

  const getStatusColor = (status: MandateTarget['status']) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      contacted: 'bg-blue-100 text-blue-800',
      in_analysis: 'bg-yellow-100 text-yellow-800',
      interested: 'bg-green-100 text-green-800',
      nda_signed: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status: MandateTarget['status']) => {
    const texts = {
      pending: 'Pendiente',
      contacted: 'En Contacto',
      in_analysis: 'En Análisis',
      interested: 'Interesado',
      nda_signed: 'NDA Firmado',
      rejected: 'Rechazado',
      closed: 'Cerrado',
    };
    return texts[status] || status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6" />
              <span>{target.company_name}</span>
              <Badge className={getStatusColor(target.status)}>
                {getStatusText(target.status)}
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="einforma">eInforma</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Header Section */}
              <TargetHeader target={target} onUpdate={onTargetUpdate} />

              <Separator />

              {/* Contact & Financial Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TargetContactSection target={target} onUpdate={onTargetUpdate} />
                <TargetFinancialSection target={target} onUpdate={onTargetUpdate} />
              </div>

              <Separator />

              {/* Quick Actions */}
              <TargetQuickActions 
                target={target}
                onAddActivity={addActivity}
                onAddFollowup={addFollowup}
                onGenerateNDA={generateNDA}
                onEnrichWithEInforma={(nif) => enrichWithEInforma(nif, false)}
              />

              {/* Pending Followups */}
              {followups.filter(f => !f.is_completed).length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Recordatorios Pendientes
                  </h4>
                  <div className="space-y-2">
                    {followups.filter(f => !f.is_completed).slice(0, 3).map((followup) => (
                      <div key={followup.id} className="flex items-center justify-between bg-white rounded p-2">
                        <div>
                          <div className="font-medium text-sm">{followup.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(followup.scheduled_date).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => completeFollowup(followup.id)}
                        >
                          Completar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-6 space-y-6">
              <ContactHistorySection targetId={target.id} />
              
              <TargetActivityTimeline 
                activities={activities}
                followups={followups}
                onAddActivity={addActivity}
                onCompleteFollowup={completeFollowup}
              />
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <TargetDocumentsSection
                target={target}
                documents={targetDocuments}
                onDocumentUploaded={onDocumentUploaded}
                onGenerateNDA={generateNDA}
              />
            </TabsContent>

            <TabsContent value="einforma" className="mt-6">
              <TargetEInformaSection
                target={target}
                enrichments={enrichments}
                isLoading={isLoading}
                onEnrich={enrichWithEInforma}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};