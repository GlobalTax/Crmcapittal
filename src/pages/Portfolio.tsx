
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PortfolioView } from "@/components/PortfolioView";

const Portfolio = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground">
            Explora y gestiona las oportunidades de inversión disponibles.
          </p>
        </div>
        
        <PortfolioView showHeader={false} />
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
