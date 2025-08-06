import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Building2, FileText, Target } from 'lucide-react';

type CRMTab = 'leads' | 'companies' | 'mandates' | 'targets';

interface FloatingActionButtonProps {
  activeTab: CRMTab;
  onAction: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  activeTab,
  onAction
}) => {
  const getIcon = () => {
    switch (activeTab) {
      case 'leads':
        return Users;
      case 'companies':
        return Building2;
      case 'mandates':
        return FileText;
      case 'targets':
        return Target;
      default:
        return Plus;
    }
  };

  const getLabel = () => {
    switch (activeTab) {
      case 'leads':
        return 'Nuevo Lead';
      case 'companies':
        return 'Nueva Empresa';
      case 'mandates':
        return 'Nuevo Mandato';
      case 'targets':
        return 'Nuevo Target';
      default:
        return 'Crear';
    }
  };

  const Icon = getIcon();

  return (
    <Button
      onClick={onAction}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 z-50"
      size="default"
      title={getLabel()}
    >
      <Icon className="h-6 w-6" />
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
};