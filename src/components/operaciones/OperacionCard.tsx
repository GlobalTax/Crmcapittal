
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OperacionCardProps {
  operacion: {
    id: string;
    name: string;
    value: string;
    score: number;
    sector: string;
  };
}

export const OperacionCard = ({ operacion }: OperacionCardProps) => {
  // Score condicional: verde si >80, amarillo si >60, rojo si <=60
  const getScoreColor = (score: number) => {
    if (score > 80) return "bg-green-100 text-green-800 border-green-200";
    if (score > 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getScoreBarColor = (score: number) => {
    if (score > 80) return "bg-green-500";
    if (score > 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-3">
      <CardHeader className="pb-2 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Título de la Operación */}
            <h5 className="text-md font-semibold text-slate-900 leading-tight">
              {operacion.name}
            </h5>
            {/* Sector */}
            <p className="text-sm text-slate-600 mt-1">{operacion.sector}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 p-4 space-y-3">
        {/* Valor de la Operación */}
        <div className="text-lg font-bold text-slate-900">
          {operacion.value}
        </div>

        {/* Score con Color Condicional */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Score:</span>
          <Badge 
            className={`${getScoreColor(operacion.score)} border`}
            variant="outline"
          >
            {operacion.score}/100
          </Badge>
        </div>

        {/* Indicador visual del score */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${getScoreBarColor(operacion.score)}`}
            style={{ width: `${operacion.score}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
