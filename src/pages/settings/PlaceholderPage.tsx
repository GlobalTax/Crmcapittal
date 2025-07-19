
import { SettingSection } from '@/components/settings/SettingSection';

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
        description="Esta funcionalidad estará disponible próximamente."
      >
        <div className="text-center py-8 text-muted-foreground">
          <p>Esta sección está en desarrollo.</p>
          <p className="text-sm mt-2">Pronto podrás configurar estas opciones.</p>
        </div>
      </SettingSection>
    </div>
  );
};
