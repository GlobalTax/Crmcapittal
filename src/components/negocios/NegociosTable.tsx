
import { useState } from 'react';
import { Table, TableBody } from "@/components/ui/table";
import { Negocio } from "@/types/Negocio";
import { EditNegocioDialog } from "./EditNegocioDialog";
import { NegociosTableHeader } from "./table/NegociosTableHeader";
import { NegocioTableRow } from "./table/NegocioTableRow";
import { useNegociosTableSorting } from "@/hooks/negocios/useNegociosTableSorting";

interface NegociosTableProps {
  negocios: Negocio[];
  onUpdate: (id: string, updates: Partial<Negocio>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export const NegociosTable = ({ negocios, onUpdate, onDelete }: NegociosTableProps) => {
  const [editingNegocio, setEditingNegocio] = useState<Negocio | null>(null);
  const { sortedNegocios, handleSort } = useNegociosTableSorting(negocios);

  if (negocios.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se encontraron negocios
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <NegociosTableHeader onSort={handleSort} />
          <TableBody>
            {sortedNegocios.map((negocio) => (
              <NegocioTableRow
                key={negocio.id}
                negocio={negocio}
                onEdit={setEditingNegocio}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {editingNegocio && (
        <EditNegocioDialog
          negocio={editingNegocio}
          open={true}
          onOpenChange={(open) => !open && setEditingNegocio(null)}
          onSuccess={async (updates) => {
            await onUpdate(editingNegocio.id, updates);
            setEditingNegocio(null);
          }}
        />
      )}
    </>
  );
};
