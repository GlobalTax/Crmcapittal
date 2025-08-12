import { useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useLeadAssignments } from "@/hooks/useLeadAssignments";
import { useWorkloadMetrics } from "@/hooks/useWorkloadMetrics";
import { WorkerLoadCard } from "./WorkerLoadCard";
import { UnassignedLeadsPool } from "./UnassignedLeadsPool";
import { AssignmentTools } from "./AssignmentTools";
import { Text } from "@/components/ui/typography";
import { Users, Settings, TrendingUp } from "lucide-react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

export const AssignmentDashboard = () => {
  const { role } = useUserRole();
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  const { 
    workers, 
    unassignedLeads, 
    assignLeads, 
    autoAssignLeads,
    redistributeWorkload,
    isAssigning 
  } = useLeadAssignments();
  
  const { workloadMetrics, isLoading: metricsLoading } = useWorkloadMetrics();

  // Only superadmins can access this
  if (role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <Text color="muted">Solo los superadministradores pueden acceder a las asignaciones</Text>
        </div>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const leadId = active.id as string;
    const workerId = over.id as string;
    
    // Check if dropping on a worker card
    if (workerId.startsWith('worker-')) {
      const actualWorkerId = workerId.replace('worker-', '');
      assignLeads([leadId], actualWorkerId);
    }
  };

  const handleBulkAssign = (workerIds: string[]) => {
    if (selectedLeads.length === 0 || workerIds.length === 0) return;
    
    // Distribute leads evenly among selected workers
    const leadsPerWorker = Math.ceil(selectedLeads.length / workerIds.length);
    
    workerIds.forEach((workerId, index) => {
      const startIndex = index * leadsPerWorker;
      const endIndex = Math.min(startIndex + leadsPerWorker, selectedLeads.length);
      const leadsToAssign = selectedLeads.slice(startIndex, endIndex);
      
      if (leadsToAssign.length > 0) {
        assignLeads(leadsToAssign, workerId);
      }
    });
    
    setSelectedLeads([]);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
            <Text variant="small" color="muted">Trabajadores Activos</Text>
          </div>
          <Text variant="large" weight="semibold" className="mt-1">
            {workers.length}
          </Text>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-warning" />
            <Text variant="small" color="muted">Leads Sin Asignar</Text>
          </div>
          <Text variant="large" weight="semibold" className="mt-1">
            {unassignedLeads.length}
          </Text>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <Text variant="small" color="muted">Conversion Promedio</Text>
          </div>
          <Text variant="large" weight="semibold" className="mt-1">
            {workloadMetrics ? Math.round(workloadMetrics.averageConversionRate * 100) : 0}%
          </Text>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-info" />
            <Text variant="small" color="muted">Carga Promedio</Text>
          </div>
          <Text variant="large" weight="semibold" className="mt-1">
            {workloadMetrics ? Math.round(workloadMetrics.averageWorkload) : 0}
          </Text>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workers Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <Text variant="large" weight="semibold">Equipo</Text>
            <Text variant="small" color="muted">{workers.length} trabajadores</Text>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {workers.map((worker) => (
                <WorkerLoadCard
                  key={worker.id}
                  worker={worker}
                  metrics={workloadMetrics?.workerMetrics[worker.id]}
                  isSelected={selectedWorkers.includes(worker.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedWorkers(prev => [...prev, worker.id]);
                    } else {
                      setSelectedWorkers(prev => prev.filter(id => id !== worker.id));
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* Unassigned Leads Column */}
          <div className="lg:col-span-1">
            <UnassignedLeadsPool
              leads={unassignedLeads}
              selectedLeads={selectedLeads}
              onLeadSelect={setSelectedLeads}
            />
          </div>

          {/* Assignment Tools Column */}
          <div className="lg:col-span-1">
            <AssignmentTools
              selectedWorkers={selectedWorkers}
              selectedLeads={selectedLeads}
              onBulkAssign={handleBulkAssign}
              onAutoAssign={autoAssignLeads}
              onRedistribute={redistributeWorkload}
              isLoading={isAssigning}
            />
          </div>
        </div>
      </div>
    </DndContext>
  );
};