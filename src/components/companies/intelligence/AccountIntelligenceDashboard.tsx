import { Suspense, lazy } from 'react';
const RelationshipMap = lazy(() => import('@/components/relationships/RelationshipMap'));
import { useAccountIntelligence } from '@/hooks/useAccountIntelligence';

interface Props {
  companyId: string;
  companyName?: string;
}

export function AccountIntelligenceDashboard({ companyId, companyName }: Props) {
  const { data, isLoading, error } = useAccountIntelligence(companyId, companyName);

  return (
    <main>
      <header className="max-w-6xl mx-auto px-6 mb-6">
        <h1 className="text-xl font-semibold">Inteligencia de Cuenta</h1>
        <p className="text-sm text-muted-foreground">Visión unificada de salud, relaciones y pipeline</p>
      </header>

      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="rounded-md border bg-card p-4">
          <h2 className="text-sm font-medium mb-2">Health Score</h2>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Calculando…</div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : data ? (
            <div className="flex items-end gap-3">
              <div className="text-4xl font-semibold">{data.healthScore}</div>
              <div className="text-sm text-muted-foreground capitalize">{data.healthLevel}</div>
            </div>
          ) : null}
          {data && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Engagement</div>
                <div className="font-medium">{Math.round(data.breakdown.engagement)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Cobertura</div>
                <div className="font-medium">{Math.round(data.breakdown.coverage)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Pipeline</div>
                <div className="font-medium">{Math.round(data.breakdown.pipeline)}%</div>
              </div>
            </div>
          )}
        </article>

        <article className="rounded-md border bg-card p-4">
          <h2 className="text-sm font-medium mb-2">Métricas Clave</h2>
          {data ? (
            <ul className="space-y-1 text-sm">
              <li>Contactos: <span className="font-medium">{data.metrics.contactsCount}</span></li>
              <li>Decisores: <span className="font-medium">{data.metrics.decisionMakers}</span></li>
              <li>Deals activos: <span className="font-medium">{data.metrics.activeDealsCount}</span></li>
              <li>Valor pipeline: <span className="font-medium">€{(data.metrics.totalPipelineValue / 1_000_000).toFixed(2)}M</span></li>
              <li>Actividades 30d: <span className="font-medium">{data.metrics.recentActivities}</span></li>
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">Sin datos</div>
          )}
        </article>

        <article className="rounded-md border bg-card p-4">
          <h2 className="text-sm font-medium mb-2">AI Insights</h2>
          {data ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {data.buyingSignals.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
              {data.suggestions.map((s, i) => (
                <li key={`s-${i}`}>{s}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          )}
        </article>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-6">
        <h2 className="text-sm font-medium mb-2">Contact Network</h2>
        <RelationshipMap companyId={companyId} />
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="rounded-md border bg-card p-4">
          <h2 className="text-sm font-medium mb-2">Deal Pipeline</h2>
          {data ? (
            <div className="text-sm text-muted-foreground">
              {data.metrics.activeDealsCount > 0
                ? `${data.metrics.activeDealsCount} deals activos por €${(data.metrics.totalPipelineValue / 1_000_000).toFixed(2)}M`
                : 'Sin deals activos'}
            </div>
          ) : null}
        </article>

        <article className="rounded-md border bg-card p-4">
          <h2 className="text-sm font-medium mb-2">Riesgos & Oportunidades</h2>
          {data ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {data.breakdown.coverage < 40 && (
                <li>Baja cobertura de decisores</li>
              )}
              {data.breakdown.engagement < 40 && (
                <li>Engagement bajo, planificar campaña</li>
              )}
              {data.breakdown.pipeline < 40 && (
                <li>Pipeline limitado, explorar expansión</li>
              )}
              {data.buyingSignals.length === 0 && (
                <li>Sin señales claras, reforzar discovery</li>
              )}
            </ul>
          ) : null}
        </article>
      </section>
    </main>
  );
}

export default AccountIntelligenceDashboard;
