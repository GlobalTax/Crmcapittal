import { User, Users, TrendingUp, Calendar, Mail, Phone } from 'lucide-react';
import { DealHighlightCard } from '@/components/deals/DealHighlightCard';
import { Contact } from '@/types/Contact';
import { RevealSection } from '@/components/ui/RevealSection';

interface PersonOverviewTabProps {
  contact: Contact;
}

export const PersonOverviewTab = ({ contact }: PersonOverviewTabProps) => {
  const getConnectionStrength = () => {
    // Calculate connection strength based on available data
    let strength = 0;
    if (contact.email) strength += 25;
    if (contact.phone) strength += 25;
    if (contact.last_contact_date) strength += 30;
    if (contact.company) strength += 20;
    
    if (strength >= 80) return { label: 'Fuerte', color: 'text-green-600' };
    if (strength >= 60) return { label: 'Media', color: 'text-yellow-600' };
    if (strength >= 40) return { label: 'Débil', color: 'text-orange-600' };
    return { label: 'Muy débil', color: 'text-red-600' };
  };

  const connectionStrength = getConnectionStrength();

  const getEmailAddresses = () => {
    const emails = [];
    if (contact.email) emails.push(contact.email);
    return emails.length > 0 ? emails.join(', ') : 'Sin direcciones de email';
  };

  const getPhoneNumbers = () => {
    const phones = [];
    if (contact.phone) phones.push(contact.phone);
    return phones.length > 0 ? phones.join(', ') : 'Sin números de teléfono';
  };

  const getPrimaryLocation = () => {
    // This would come from contact data in a real implementation
    return 'No establecido';
  };

  return (
    <div className="space-y-6">
      {/* Highlight Cards Grid 3x2 (toggle) */}
      <RevealSection storageKey="contact/overview-cards" defaultCollapsed={false} collapsedLabel="Mostrar tarjetas" expandedLabel="Ocultar tarjetas" count={6}>
        <div className="grid grid-cols-3 gap-4">
          <DealHighlightCard
            title="Fuerza de conexión"
            icon={User}
            value={
              <span className={connectionStrength.color}>
                {connectionStrength.label}
              </span>
            }
            subtitle="Basado en interacciones"
          />

          <DealHighlightCard
            title="Próxima interacción"
            icon={Calendar}
            value="No hay reuniones programadas"
            subtitle="Programar reunión"
          />

          <DealHighlightCard
            title="Empresa"
            icon={Users}
            value={contact.company || 'Sin empresa'}
            subtitle={contact.position || 'Sin cargo'}
          />

          <DealHighlightCard
            title="Direcciones de email"
            icon={Mail}
            value={getEmailAddresses()}
            subtitle={`${contact.email ? '1' : '0'} dirección de email`}
          />

          <DealHighlightCard
            title="Números de teléfono"
            icon={Phone}
            value={getPhoneNumbers()}
            subtitle={`${contact.phone ? '1' : '0'} número de teléfono`}
          />

          <DealHighlightCard
            title="Ubicación principal"
            icon={TrendingUp}
            value={getPrimaryLocation()}
            subtitle="Ubicación no especificada"
          />
        </div>
      </RevealSection>

      {/* Recent Activity Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Actividad Reciente</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div className="flex-1">
              <p className="text-sm">Contacto creado</p>
              <p className="text-xs text-muted-foreground">
                {new Date(contact.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {contact.updated_at !== contact.created_at && (
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">Contacto actualizado</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(contact.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {contact.last_contact_date && (
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">Última interacción</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(contact.last_contact_date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {(!contact.last_contact_date && contact.updated_at === contact.created_at) && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
              <p className="text-xs text-muted-foreground">La actividad aparecerá aquí cuando ocurra</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};