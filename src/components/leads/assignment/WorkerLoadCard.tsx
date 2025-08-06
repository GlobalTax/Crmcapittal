import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { Progress } from "@/components/ui/progress";
import { User, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";

interface Worker {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  assignedLeadsCount: number;
}

interface WorkerMetrics {
  conversionRate: number;
  averageResponseTime: number;
  completedLeads: number;
  totalLeads: number;
  workloadScore: number; // 0-100
}

interface WorkerLoadCardProps {
  worker: Worker;
  metrics?: WorkerMetrics;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

export const WorkerLoadCard = ({ worker, metrics, isSelected, onSelect }: WorkerLoadCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: `worker-${worker.id}`,
  });

  const getWorkloadColor = (score: number) => {
    if (score >= 80) return "destructive";
    if (score >= 60) return "warning";
    return "success";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-card rounded-lg border p-4 transition-all duration-200 hover-lift cursor-pointer
        ${isSelected ? 'ring-2 ring-primary border-primary' : ''}
        ${isOver ? 'border-success bg-success/5' : ''}
        ${isHovered ? 'shadow-md' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(!isSelected)}
    >
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(worker.first_name, worker.last_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <Text weight="medium" className="truncate">
            {worker.first_name} {worker.last_name}
          </Text>
          <Text variant="small" color="muted" className="truncate">
            {worker.email}
          </Text>
        </div>
        
        <Badge variant="secondary" className="ml-2">
          {worker.assignedLeadsCount}
        </Badge>
      </div>

      {/* Workload Progress */}
      {metrics && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Text variant="small" color="muted">Carga de trabajo</Text>
              <Text variant="small" weight="medium">
                {metrics.workloadScore}%
              </Text>
            </div>
            <Progress 
              value={metrics.workloadScore} 
              className="h-2"
            />
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <Text variant="xs" color="muted">Conv.</Text>
              </div>
              <Text variant="small" weight="medium">
                {Math.round(metrics.conversionRate * 100)}%
              </Text>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <Text variant="xs" color="muted">Resp.</Text>
              </div>
              <Text variant="small" weight="medium">
                {metrics.averageResponseTime}h
              </Text>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3 text-muted-foreground" />
                <Text variant="xs" color="muted">Done</Text>
              </div>
              <Text variant="small" weight="medium">
                {metrics.completedLeads}
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* Drop Zone Indicator */}
      {isOver && (
        <div className="mt-3 p-2 border-2 border-dashed border-success rounded bg-success/5 text-center">
          <Text variant="small" color="success">
            Soltar para asignar leads
          </Text>
        </div>
      )}
    </div>
  );
};