
import { useState } from 'react';
import { Table, TableBody } from "@/components/ui/table";
import { Deal } from "@/types/Deal";
import { EditDealDialog } from "./EditDealDialog";
import { DealsTableHeader } from "./table/DealsTableHeader";
import { DealTableRow } from "./table/DealTableRow";
import { useDealsTableSorting } from "@/hooks/deals/useDealsTableSorting";

interface DealsTableProps {
  deals: Deal[];
  onUpdate: (id: string, updates: Partial<Deal>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export const DealsTable = ({ deals, onUpdate, onDelete }: DealsTableProps) => {
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const { sortedDeals, handleSort } = useDealsTableSorting(deals);

  if (deals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se encontraron deals
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <DealsTableHeader onSort={handleSort} />
          <TableBody>
            {sortedDeals.map((deal) => (
              <DealTableRow
                key={deal.id}
                deal={deal}
                onEdit={setEditingDeal}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {editingDeal && (
        <EditDealDialog
          deal={editingDeal}
          open={true}
          onOpenChange={(open) => !open && setEditingDeal(null)}
          onSuccess={async (updates) => {
            await onUpdate(editingDeal.id, updates);
            setEditingDeal(null);
          }}
        />
      )}
    </>
  );
};
