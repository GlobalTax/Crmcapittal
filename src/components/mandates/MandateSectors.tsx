import { Badge } from '@/components/ui/badge';

interface MandateSectorsProps {
  sectors: string[];
  locations?: string[];
  showTitle?: boolean;
  className?: string;
}

export const MandateSectors = ({ 
  sectors, 
  locations, 
  showTitle = true, 
  className = "" 
}: MandateSectorsProps) => {
  return (
    <div className={className}>
      {showTitle && <h4 className="font-medium mb-2">Sectores Objetivo</h4>}
      <div className="flex flex-wrap gap-1">
        {sectors.map((sector) => (
          <Badge key={sector} variant="outline" className="text-xs">
            {sector}
          </Badge>
        ))}
      </div>
      {locations && locations.length > 0 && (
        <div className="mt-2">
          <h5 className="text-sm font-medium text-muted-foreground">Ubicaciones:</h5>
          <p className="text-sm">{locations.join(', ')}</p>
        </div>
      )}
    </div>
  );
};