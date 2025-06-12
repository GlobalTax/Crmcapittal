
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useFavoriteOperations } from '@/hooks/useFavoriteOperations';
import { useToast } from '@/hooks/use-toast';

interface FavoriteButtonProps {
  operationId: string;
  size?: 'sm' | 'default' | 'lg';
}

export const FavoriteButton = ({ operationId, size = 'sm' }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoriteOperations();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas iniciar sesión para guardar oportunidades",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      if (isFavorite(operationId)) {
        await removeFromFavorites(operationId);
        toast({
          title: "Removido de favoritos",
          description: "La oportunidad ha sido removida de tus favoritos",
        });
      } else {
        await addToFavorites(operationId);
        toast({
          title: "Añadido a favoritos",
          description: "La oportunidad ha sido guardada en tus favoritos",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar tus favoritos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isCurrentlyFavorite = isFavorite(operationId);

  return (
    <Button
      variant={isCurrentlyFavorite ? "default" : "outline"}
      size={size}
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`${isCurrentlyFavorite ? 'bg-red-500 hover:bg-red-600' : ''}`}
    >
      <Heart 
        className={`h-4 w-4 ${isCurrentlyFavorite ? 'fill-current' : ''}`} 
      />
      {size !== 'sm' && (
        <span className="ml-2">
          {isCurrentlyFavorite ? 'Guardado' : 'Guardar'}
        </span>
      )}
    </Button>
  );
};
