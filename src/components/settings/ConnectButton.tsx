
import { Button } from '@/components/ui/button';
import { Chrome, Mail } from 'lucide-react';

interface ConnectButtonProps {
  provider: 'google' | 'microsoft';
  onClick: () => void;
  disabled?: boolean;
}

export const ConnectButton = ({ provider, onClick, disabled }: ConnectButtonProps) => {
  const config = {
    google: {
      icon: Chrome,
      label: 'Conectar Google',
      color: 'border-blue-200 hover:border-blue-300 text-blue-700'
    },
    microsoft: {
      icon: Mail,
      label: 'Conectar Microsoft',
      color: 'border-orange-200 hover:border-orange-300 text-orange-700'
    }
  };

  const { icon: Icon, label, color } = config[provider];

  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={`${color} ${disabled ? 'opacity-50' : ''}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};
