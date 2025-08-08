import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type RelationshipType = 'reporting' | 'collaboration' | 'influence' | 'information';

export interface RelationshipGraphNode {
  id: string;
  name: string;
  positionTitle?: string | null;
  department?: string | null;
  avatar_url?: string | null;
  influence: number; // 1-5
}

export interface RelationshipGraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  strength: number; // 0-1
  label?: string;
}

interface UseRelationshipGraphResult {
  nodes: RelationshipGraphNode[];
  edges: RelationshipGraphEdge[];
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
}

const rankFromTitle = (title?: string | null) => {
  if (!title) return 2;
  const t = title.toLowerCase();
  if (/(ceo|owner|founder|president)/.test(t)) return 5;
  if (/(cfo|coo|cto|cio|partner|vp|vice\s*president|director|head)/.test(t)) return 4;
  if (/(manager|lead|gerente|jefe)/.test(t)) return 3;
  if (/(analyst|associate|especialista|técnico)/.test(t)) return 2;
  return 2;
};

export const useRelationshipGraph = (companyId: string): UseRelationshipGraphResult => {
  const [nodes, setNodes] = useState<RelationshipGraphNode[]>([]);
  const [edges, setEdges] = useState<RelationshipGraphEdge[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!companyId) return;
      setIsLoading(true);
      setError(null);
      try {
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('company_id', companyId)
          .order('name', { ascending: true });

        if (contactsError) throw contactsError;

        const mappedNodes: RelationshipGraphNode[] = (contacts || []).map((c: any) => ({
          id: c.id,
          name: c.name || c.email || 'Contacto',
          positionTitle: c.position || null,
          department: c.department || null,
          avatar_url: c.avatar_url || null,
          influence: typeof c.influence === 'number' ? c.influence : rankFromTitle(c.position),
        }));

        // Build relationships heuristically
        const tempEdges: RelationshipGraphEdge[] = [];

        // Reporting edges (subordinate -> manager/exec)
        for (let i = 0; i < mappedNodes.length; i++) {
          for (let j = 0; j < mappedNodes.length; j++) {
            if (i === j) continue;
            const a = mappedNodes[i];
            const b = mappedNodes[j];
            const sameDept = !!a.department && a.department === b.department;
            const rankDiff = b.influence - a.influence;
            const seniorIsExec = b.influence >= 4;
            if ((sameDept && rankDiff >= 1) || seniorIsExec) {
              // a reports to b (heuristic)
              tempEdges.push({
                id: `rep-${a.id}-${b.id}`,
                source: a.id,
                target: b.id,
                type: 'reporting',
                strength: seniorIsExec ? 0.85 : 0.7,
                label: 'Reporting',
              });
            }
          }
        }

        // Collaboration edges (within same department)
        for (let i = 0; i < mappedNodes.length; i++) {
          for (let j = i + 1; j < mappedNodes.length; j++) {
            const a = mappedNodes[i];
            const b = mappedNodes[j];
            if (a.department && b.department && a.department === b.department) {
              tempEdges.push({
                id: `col-${a.id}-${b.id}`,
                source: a.id,
                target: b.id,
                type: 'collaboration',
                strength: 0.45,
                label: 'Colaboración',
              });
            }
          }
        }

        // Influence edges (exec -> others)
        const execs = mappedNodes.filter((n) => n.influence >= 4);
        execs.forEach((e) => {
          mappedNodes.forEach((n) => {
            if (n.id !== e.id) {
              tempEdges.push({
                id: `inf-${e.id}-${n.id}`,
                source: e.id,
                target: n.id,
                type: 'influence',
                strength: 0.6,
                label: 'Influencia',
              });
            }
          });
        });

        // Limit edges to avoid clutter
        const limitedEdges = tempEdges.slice(0, 40);

        // Suggestions
        const decisionMakers = mappedNodes.filter((n) => n.influence >= 4);
        const coverage = mappedNodes.length > 0 ? decisionMakers.length / mappedNodes.length : 0;
        const sugg: string[] = [];
        if (decisionMakers.length === 0) {
          sugg.push('Identificar decision maker (CEO/CFO/Dir.)');
        }
        if (coverage < 0.3) {
          sugg.push('Ampliar cobertura con managers clave por departamento');
        }
        if (!limitedEdges.some((e) => e.type === 'influence')) {
          sugg.push('Conectar con decisores a través de intro cálida');
        }

        setNodes(mappedNodes);
        setEdges(limitedEdges);
        setSuggestions(sugg);
      } catch (e: any) {
        console.error('useRelationshipGraph error', e);
        setError('No se pudo cargar el mapa de relaciones');
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [companyId]);

  return useMemo(
    () => ({ nodes, edges, suggestions, isLoading, error }),
    [nodes, edges, suggestions, isLoading, error]
  );
};
