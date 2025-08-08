
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type SummaryRow = {
  metric_date: string;
  feature_key: string;
  environment: string;
  dialog_opened: number;
  entity_created: number;
  entity_creation_failed: number;
  success_rate: number;
};

const fetchAdoptionSummary = async (envFilter?: string): Promise<SummaryRow[]> => {
  let query = supabase
    .from('feature_adoption_summary')
    .select('*')
    .eq('feature_key', 'lead_closure_dialog')
    .order('metric_date', { ascending: false })
    .limit(30);

  if (envFilter && envFilter !== 'all') {
    query = query.eq('environment', envFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as SummaryRow[];
};

export const FeatureAdoptionDashboard: React.FC = () => {
  const [env, setEnv] = React.useState<'all' | 'development' | 'staging' | 'production'>('all');

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['feature_adoption_summary', 'lead_closure_dialog', env],
    queryFn: () => fetchAdoptionSummary(env === 'all' ? undefined : env),
    staleTime: 60_000,
  });

  const totals = React.useMemo(() => {
    const rows = data || [];
    const agg = rows.reduce(
      (acc, r) => {
        acc.opened += r.dialog_opened || 0;
        acc.created += r.entity_created || 0;
        acc.failed += r.entity_creation_failed || 0;
        return acc;
      },
      { opened: 0, created: 0, failed: 0 }
    );
    const attempts = agg.created + agg.failed;
    const rate = attempts ? +(agg.created / attempts).toFixed(2) : 0;
    return { ...agg, rate };
  }, [data]);

  return (
    <Card className="w-full max-w-3xl">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Adopción — Cierre de Lead</h3>
            <p className="text-sm text-muted-foreground">Feature: lead_closure_dialog</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value as any)}
              className="h-9 rounded-md border bg-background px-2 text-sm"
            >
              <option value="all">Todos los entornos</option>
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
            <button
              onClick={() => refetch()}
              className="h-9 rounded-md border px-3 text-sm"
              disabled={isFetching}
            >
              {isFetching ? 'Actualizando...' : 'Refrescar'}
            </button>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border">
            <div className="text-sm text-muted-foreground">Diálogos abiertos</div>
            <div className="text-2xl font-semibold">{totals.opened}</div>
          </div>
          <div className="p-3 rounded-lg border">
            <div className="text-sm text-muted-foreground">Entidades creadas</div>
            <div className="text-2xl font-semibold">{totals.created}</div>
          </div>
          <div className="p-3 rounded-lg border">
            <div className="text-sm text-muted-foreground">Errores</div>
            <div className="text-2xl font-semibold">{totals.failed}</div>
          </div>
          <div className="p-3 rounded-lg border">
            <div className="text-sm text-muted-foreground">Tasa de éxito</div>
            <div className="text-2xl font-semibold">{(totals.rate * 100).toFixed(0)}%</div>
          </div>
        </div>

        <Separator />

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Cargando métricas...</div>
        ) : error ? (
          <div className="text-sm text-destructive">No se pudieron cargar las métricas</div>
        ) : (
          <div className="space-y-2">
            {(data || []).map((row) => (
              <div
                key={`${row.metric_date}-${row.environment}`}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{row.environment}</Badge>
                  <div className="text-sm">
                    <div className="font-medium">{new Date(row.metric_date).toLocaleDateString('es-ES')}</div>
                    <div className="text-muted-foreground">
                      abiertos {row.dialog_opened} · creados {row.entity_created} · errores {row.entity_creation_failed}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {(row.success_rate * 100).toFixed(0)}%
                </div>
              </div>
            ))}
            {(data || []).length === 0 && (
              <div className="text-sm text-muted-foreground">No hay datos para mostrar.</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureAdoptionDashboard;
