import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Users, Euro, TrendingUp, Calendar } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Teaser = Database['public']['Tables']['teasers']['Row'];

interface TeaserPreviewProps {
  teaser: Partial<Teaser>;
}

export function TeaserPreview({ teaser }: TeaserPreviewProps) {
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: teaser.currency || 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (!num) return 'No especificado';
    return new Intl.NumberFormat('es-ES').format(num);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            OPORTUNIDAD DE INVERSIÓN
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {teaser.anonymous_company_name || 'Empresa Líder'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {teaser.sector && (
            <span className="inline-flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {teaser.sector}
            </span>
          )}
          {teaser.location && (
            <span className="inline-flex items-center gap-1 ml-4">
              <MapPin className="w-4 h-4" />
              {teaser.location}
            </span>
          )}
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Facturación Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(teaser.revenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              EBITDA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(teaser.ebitda)}</div>
            {teaser.revenue && teaser.ebitda && (
              <div className="text-sm text-muted-foreground mt-1">
                Margen: {Math.round((teaser.ebitda / teaser.revenue) * 100)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Empleados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(teaser.employees)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Company Overview */}
      {teaser.financial_summary && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {typeof teaser.financial_summary === 'string' 
                ? teaser.financial_summary 
                : JSON.stringify(teaser.financial_summary)
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Highlights */}
      {teaser.key_highlights && teaser.key_highlights.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Puntos Clave de la Oportunidad</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {teaser.key_highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Investment Details */}
      {teaser.asking_price && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detalles de la Oportunidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Precio Orientativo
                </div>
                <div className="text-lg font-semibold">{formatCurrency(teaser.asking_price)}</div>
              </div>
              {teaser.ebitda && teaser.asking_price && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Múltiplo EBITDA
                  </div>
                  <div className="text-lg font-semibold">
                    {(teaser.asking_price / teaser.ebitda).toFixed(1)}x
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">¿Interesado en esta oportunidad?</h3>
            <p className="text-muted-foreground mb-4">
              Contacta con nosotros para más información y acceso a documentación detallada
            </p>
            <div className="text-sm text-muted-foreground">
              Este teaser es confidencial y está destinado únicamente a inversores cualificados
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          Generado el {new Date().toLocaleDateString('es-ES')}
        </div>
      </div>
    </div>
  );
}