import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface FloatingEditButtonProps {
  onClick: () => void;
}

export const FloatingEditButton = ({ onClick }: FloatingEditButtonProps) => {
  return (
    <Button
      size="sm"
      className="absolute top-4 right-4 z-10 h-8 w-8 p-0 shadow-md hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <Edit className="h-4 w-4" />
    </Button>
  );
};