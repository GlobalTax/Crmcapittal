interface MandateProgressProps {
  totalTargets: number;
  contactedTargets: number;
  showTitle?: boolean;
  className?: string;
}

export const MandateProgress = ({ 
  totalTargets, 
  contactedTargets, 
  showTitle = true, 
  className = "" 
}: MandateProgressProps) => {
  const completionRate = totalTargets > 0 ? Math.round((contactedTargets / totalTargets) * 100) : 0;

  return (
    <div className={className}>
      {showTitle && <h4 className="font-medium mb-2">Progreso del Proceso</h4>}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Empresas identificadas</span>
          <span className="font-medium">{totalTargets}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Empresas contactadas</span>
          <span className="font-medium text-primary">{contactedTargets}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Progreso</span>
          <span className="font-medium">{completionRate}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all" 
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};