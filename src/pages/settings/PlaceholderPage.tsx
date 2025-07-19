import { SettingSection } from '@/components/settings/SettingSection';
import { Settings } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <SettingSection 
        title="Próximamente"
        description="Esta funcionalidad está actualmente en desarrollo."
      >
        <div className="text-center py-12">
          <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Funcionalidad en Desarrollo</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Estamos trabajando duro para ofrecerte esta funcionalidad. ¡Vuelve pronto para actualizaciones!
          </p>
        </div>
      </SettingSection>
    </div>
  );
};