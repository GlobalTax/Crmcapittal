import { memo, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRelationshipGraph } from '@/hooks/useRelationshipGraph';

interface RelationshipMapProps {
  companyId: string;
  height?: number;
}

const ContactNode = memo(({ data }: any) => {
  const c = data.contact as {
    name: string;
    positionTitle?: string | null;
    avatar_url?: string | null;
    influence: number;
    department?: string | null;
  };
  return (
    <div className="rounded-md border bg-card text-card-foreground p-2 min-w-[160px]">
      <div className="flex items-center gap-2">
        {c.avatar_url ? (
          <img
            src={c.avatar_url}
            alt={`Foto de ${c.name}`}
            className="h-8 w-8 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
            {c.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <div className="text-sm font-medium leading-none">{c.name}</div>
          {c.positionTitle && (
            <div className="text-xs text-muted-foreground">{c.positionTitle}</div>
          )}
        </div>
      </div>
      {c.department && (
        <div className="mt-1 text-[10px] text-muted-foreground">{c.department}</div>
      )}
    </div>
  );
});

const edgeColor = (type: string) => {
  switch (type) {
    case 'reporting':
      return 'hsl(var(--primary))';
    case 'collaboration':
      return 'hsl(var(--muted-foreground))';
    case 'influence':
      return 'hsl(var(--accent))';
    case 'information':
      return 'hsl(var(--secondary))';
    default:
      return 'hsl(var(--border))';
  }
};

export function RelationshipMap({ companyId, height = 520 }: RelationshipMapProps) {
  const { nodes: srcNodes, edges: srcEdges, isLoading, error } = useRelationshipGraph(companyId);

  const { rfNodes, rfEdges } = useMemo(() => {
    // Simple radial layout
    const centerX = 300;
    const centerY = 260;
    const r = 220;
    const rfNodes: Node[] = srcNodes.map((n, idx) => {
      const angle = (idx / Math.max(srcNodes.length, 1)) * Math.PI * 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return {
        id: n.id,
        type: 'contactNode',
        position: { x, y },
        data: { contact: n },
      } as Node;
    });

    const rfEdges: Edge[] = srcEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      label: e.label,
      animated: false,
      style: {
        stroke: edgeColor(e.type),
        strokeWidth: Math.max(1, e.strength * 4),
      },
      labelStyle: {
        fill: 'hsl(var(--muted-foreground))',
        fontSize: 10,
      },
    }));

    return { rfNodes, rfEdges };
  }, [srcNodes, srcEdges]);

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  return (
    <section aria-label="Mapa de relaciones" className="w-full">
      <div className="rounded-md border bg-card" style={{ height }}>
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
            Cargando mapa de relaciones…
          </div>
        ) : (
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={{ contactNode: ContactNode as any }}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap zoomable pannable />
            <Controls />
            <Background />
          </ReactFlow>
        )}
      </div>
    </section>
  );
}

export default RelationshipMap;
