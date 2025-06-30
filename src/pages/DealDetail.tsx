
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Deal } from "@/types/Deal";
import { useDeals } from "@/hooks/useDeals";
import { EditDealDialog } from "@/components/deals/EditDealDialog";
import { DealHeader } from "@/components/deals/detail/DealHeader";
import { DealInfoSection } from "@/components/deals/detail/DealInfoSection";
import { CompanyInfoSection } from "@/components/deals/detail/CompanyInfoSection";
import { ContactSidebar } from "@/components/deals/detail/ContactSidebar";
import { ActivityTimeline } from "@/components/deals/detail/ActivityTimeline";
import { MetricsPanel } from "@/components/deals/detail/MetricsPanel";

const DealDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { deals, loading, updateDeal } = useDeals();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [editingDeal, setEditingDeal] = useState(false);

  useEffect(() => {
    if (deals.length > 0 && id) {
      const foundDeal = deals.find(d => d.id === id);
      setDeal(foundDeal || null);
    }
  }, [deals, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900">Deal no encontrado</h2>
          <p className="text-gray-600 mt-2">El deal que buscas no existe o no tienes permisos para verlo.</p>
          <Link to="/deals">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Negocios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DealHeader deal={deal} onEdit={() => setEditingDeal(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido Principal */}
        <div className="lg:col-span-2 space-y-6">
          <DealInfoSection deal={deal} />
          <CompanyInfoSection deal={deal} />
        </div>

        {/* Sidebar Derecho */}
        <div className="space-y-6">
          <ContactSidebar deal={deal} />
          <ActivityTimeline deal={deal} />
          <MetricsPanel deal={deal} />
        </div>
      </div>

      {/* Edit Dialog */}
      {editingDeal && (
        <EditDealDialog
          deal={deal}
          open={editingDeal}
          onOpenChange={setEditingDeal}
          onSuccess={async (updates) => {
            await updateDeal(deal.id, updates);
            setEditingDeal(false);
            // Actualizar el deal local
            setDeal({ ...deal, ...updates });
          }}
        />
      )}
    </div>
  );
};

export default DealDetail;
