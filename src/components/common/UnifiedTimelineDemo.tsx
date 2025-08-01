import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedTimeline } from './UnifiedTimeline';
import { Activity, Users, RotateCcw, Shield } from 'lucide-react';

/**
 * Demo component to showcase the UnifiedTimeline for all entity types
 */
export function UnifiedTimelineDemo() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Timeline Unificado - Demo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Demostración del componente UnifiedTimeline para todos los tipos de entidades
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="lead" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lead" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Lead
            </TabsTrigger>
            <TabsTrigger value="mandate" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Mandato
            </TabsTrigger>
            <TabsTrigger value="reconversion" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reconversión
            </TabsTrigger>
            <TabsTrigger value="valoracion" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Valoración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lead" className="mt-6">
            <UnifiedTimeline
              entityType="lead"
              entityId="demo-lead-1"
              title="Timeline de Lead (Demo)"
              showFilters={true}
              showExport={true}
              maxHeight="500px"
            />
          </TabsContent>

          <TabsContent value="mandate" className="mt-6">
            <UnifiedTimeline
              entityType="mandate"
              entityId="demo-mandate-1"
              title="Timeline de Mandato (Demo)"
              showFilters={true}
              showExport={true}
              maxHeight="500px"
            />
          </TabsContent>

          <TabsContent value="reconversion" className="mt-6">
            <UnifiedTimeline
              entityType="reconversion"
              entityId="demo-reconversion-1"
              title="Timeline de Reconversión (Demo)"
              showFilters={true}
              showExport={true}
              maxHeight="500px"
            />
          </TabsContent>

          <TabsContent value="valoracion" className="mt-6">
            <UnifiedTimeline
              entityType="valoracion"
              entityId="demo-valoracion-1"
              title="Timeline de Valoración (Demo)"
              showFilters={true}
              showExport={true}
              maxHeight="500px"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}