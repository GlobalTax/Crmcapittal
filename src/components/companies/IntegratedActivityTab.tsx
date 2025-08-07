import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, StickyNote, Calendar, MessageSquare } from 'lucide-react';
import { Company } from '@/types/Company';

// Lazy imports for performance
const CompanyTimeline = React.lazy(() => 
  import('@/components/companies/CompanyTimeline').then(module => ({ default: module.CompanyTimeline }))
);

const CompanyNotesSection = React.lazy(() => 
  import('@/components/companies/CompanyNotesSection').then(module => ({ default: module.CompanyNotesSection }))
);

interface IntegratedActivityTabProps {
  company: Company;
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="border rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
          <div className="h-3 bg-muted rounded animate-pulse w-16" />
        </div>
        <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
      </div>
    ))}
  </div>
);

export const IntegratedActivityTab = ({ company }: IntegratedActivityTabProps) => {
  // Stats rápidas de actividad (estos datos vendrían de hooks reales)
  const activityStats = {
    totalActivities: 0, // Esto vendría de un hook
    notesCount: 0,
    callsCount: 0,
    emailsCount: 0,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header con estadísticas de actividad */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activityStats.totalActivities}</p>
                <p className="text-sm text-muted-foreground">Total Actividades</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <StickyNote className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activityStats.notesCount}</p>
                <p className="text-sm text-muted-foreground">Notas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activityStats.callsCount}</p>
                <p className="text-sm text-muted-foreground">Llamadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activityStats.emailsCount}</p>
                <p className="text-sm text-muted-foreground">Reuniones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Timeline y Notas */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Timeline de Actividad
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Notas y Comentarios
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="mt-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <CompanyTimeline company={company} />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="notes" className="mt-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <CompanyNotesSection company={company} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};