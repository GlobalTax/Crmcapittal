import { SimpleLeadManagement } from '@/components/leads/SimpleLeadManagement';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { HubSpotImport } from '@/components/import/HubSpotImport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLeads } from '@/hooks/useLeads';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LeadsEntryPanel() {
  const { leads, isLoading } = useLeads();
  const prevTempsRef = useRef<Record<string, 'hot'|'warm'|'cold'>>({});
  const [justBecameHot, setJustBecameHot] = useState<string[]>([]);
  const navigate = useNavigate();

  const temperatureFromScore = (score: number): 'hot'|'warm'|'cold' => {
    if (score >= 80) return 'hot';
    if (score >= 50) return 'warm';
    return 'cold';
  };

  const withScores = useMemo(() => {
    return (leads || []).map(l => {
      const score = (l as any).aiScore ?? (l as any).lead_score ?? 0;
      const temp: 'hot'|'warm'|'cold' = (l as any).temperature ?? temperatureFromScore(score);
      return { ...l, _score: score as number, _temp: temp } as any;
    });
  }, [leads]);

  const distribution = useMemo(() => {
    return withScores.reduce((acc: any, l: any) => {
      acc[l._temp] = (acc[l._temp] || 0) + 1;
      return acc;
    }, { hot: 0, warm: 0, cold: 0 });
  }, [withScores]);

  const top5 = useMemo(() => {
    return [...withScores].sort((a: any, b: any) => (b._score - a._score)).slice(0, 5);
  }, [withScores]);

  useEffect(() => {
    const prev = prevTempsRef.current;
    const nowHot: string[] = [];
    withScores.forEach((l: any) => {
      const prevT = prev[l.id];
      if (prevT === 'cold' && l._temp === 'hot') nowHot.push(l.id);
      prev[l.id] = l._temp;
    });
    if (nowHot.length > 0) setJustBecameHot(nowHot);
  }, [withScores]);

  return (
    <ErrorBoundary>
      {/* Widgets: distribución + Top 5 + alerta cold→hot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Distribución por temperatura</p>
            <div className="flex items-center gap-3">
              <Badge className="bg-red-50 text-red-700 border-red-200">Hot: {distribution.hot}</Badge>
              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Warm: {distribution.warm}</Badge>
              <Badge className="bg-gray-50 text-gray-700 border-gray-200">Cold: {distribution.cold}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Top 5 leads por score</p>
            </div>
            <div className="space-y-2">
              {top5.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between border-b last:border-b-0 py-2">
                  <div>
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.company || 'Sin empresa'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={l._temp === 'hot' ? 'bg-red-50 text-red-700 border-red-200' : l._temp === 'warm' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>
                      {l._temp.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-semibold">{l._score}</span>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/leads/${l.id}`)} title="Ver lead">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {top5.length === 0 && <div className="text-sm text-muted-foreground">Sin datos</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {justBecameHot.length > 0 && (
        <Card className="mb-4 border-red-200">
          <CardContent className="p-3">
            <div className="text-sm"><span className="font-semibold">Alerta:</span> {justBecameHot.length} lead(s) pasaron de Cold a Hot</div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Gestión de Leads</TabsTrigger>
          <TabsTrigger value="import">Importar HubSpot</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads">
          <SimpleLeadManagement />
        </TabsContent>
        
        <TabsContent value="import">
          <HubSpotImport />
        </TabsContent>
      </Tabs>
    </ErrorBoundary>
  );
}