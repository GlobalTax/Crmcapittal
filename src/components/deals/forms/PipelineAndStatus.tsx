
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";

interface PipelineAndStatusProps {
  dealData: any;
  updateField: (field: string, value: string) => void;
  stages: any[];
}

const priorities = [
  { value: "baja", label: "Baja", color: "bg-gray-100 text-gray-800" },
  { value: "media", label: "Media", color: "bg-yellow-100 text-yellow-800" },
  { value: "alta", label: "Alta", color: "bg-orange-100 text-orange-800" },
  { value: "urgente", label: "Urgente", color: "bg-red-100 text-red-800" }
];

export const PipelineAndStatus = ({ dealData, updateField, stages }: PipelineAndStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
          <Flag className="h-4 w-4 mr-2" />
          Pipeline y Estado
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stage_id">Etapa del Pipeline</Label>
          <Select value={dealData.stage_id} onValueChange={(value) => updateField("stage_id", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map(stage => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="priority">Prioridad</Label>
          <Select value={dealData.priority} onValueChange={(value) => updateField("priority", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(priority => (
                <SelectItem key={priority.value} value={priority.value}>
                  <div className="flex items-center">
                    <Badge className={`mr-2 ${priority.color}`}>
                      {priority.label}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
