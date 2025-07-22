import React, { useState, useEffect } from 'react';
import { Plus, Calculator, Euro, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateValoracionForm } from '@/components/valoraciones/CreateValoracionForm';
import { ValoracionCard } from '@/components/valoraciones/ValoracionCard';
import { supabase } from '@/integrations/supabase/client';
import { Valoracion } from '@/types/Valoracion';
import { Contact } from '@/types/Contact';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { formatCurrency } from '@/utils/format';

interface ContactValoracionesTabProps {
  contact: Contact;
}

export function ContactValoracionesTab({ contact }: ContactValoracionesTabProps) {
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadValoraciones();
  }, [contact.id]);

  const loadValoraciones = async () => {
    try {
      const { data, error } = await supabase
        .from('valoraciones')
        .select('*')
        .eq('client_name', contact.name)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const typedData = (data || []).map(v => ({
        ...v,
        status: v.status as any,
        payment_status: v.payment_status as any
      })) as Valoracion[];
      setValoraciones(typedData);
    } catch (error) {
      console.error('Error loading valoraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateValoracion = async (data: any) => {
    try {
      const { error } = await supabase
        .from('valoraciones')
        .insert({
          ...data,
          contact_id: contact.id,
          client_name: contact.name
        });

      if (error) throw error;
      
      setShowCreateForm(false);
      loadValoraciones();
    } catch (error) {
      console.error('Error creating valoración:', error);
    }
  };

  const getTotalFees = () => {
    return valoraciones.reduce((total, v) => total + (v.fee_quoted || 0), 0);
  };

  const getCollectedFees = () => {
    return valoraciones.reduce((total, v) => total + (v.fee_charged || 0), 0);
  };

  const getPendingFees = () => {
    return getTotalFees() - getCollectedFees();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Valoraciones</h3>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Valoración
        </Button>
      </div>

      {valoraciones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Valoraciones</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{valoraciones.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Honorarios Cotizados</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalFees())}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Honorarios Cobrados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(getCollectedFees())}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendiente de Cobro</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(getPendingFees())}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {valoraciones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay valoraciones</h3>
            <p className="text-muted-foreground text-center mb-4">
              Este contacto no tiene valoraciones asociadas aún.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Valoración
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {valoraciones.map((valoracion) => (
            <div key={valoracion.id} className="space-y-2">
              <ValoracionCard
                valoracion={valoracion}
                onView={() => window.open(`/valoraciones`, '_blank')}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="outline" className={VALORACION_PHASES[valoracion.status]?.bgColor}>
                  {VALORACION_PHASES[valoracion.status]?.icon} {VALORACION_PHASES[valoracion.status]?.label}
                </Badge>
                {valoracion.fee_quoted && (
                  <span className="font-medium">
                    {formatCurrency(valoracion.fee_quoted)} / {formatCurrency(valoracion.fee_charged || 0)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateValoracionForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateValoracion}
      />
    </div>
  );
}