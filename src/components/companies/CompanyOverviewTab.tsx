import { Building2, Users, TrendingUp, Calendar, Globe, MapPin } from 'lucide-react';
import { DealHighlightCard } from '@/components/deals/DealHighlightCard';
import { Company } from '@/types/Company';

interface CompanyOverviewTabProps {
  company: Company;
}

export const CompanyOverviewTab = ({ company }: CompanyOverviewTabProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConnectionStrength = () => {
    // Mock calculation based on available data
    let strength = 0;
    if (company.website) strength += 20;
    if (company.phone) strength += 20;
    if (company.linkedin_url) strength += 20;
    if (company.description) strength += 20;
    if (company.contacts_count && company.contacts_count > 0) strength += 20;
    
    if (strength >= 80) return { label: 'Strong', color: 'text-green-600' };
    if (strength >= 60) return { label: 'Medium', color: 'text-yellow-600' };
    if (strength >= 40) return { label: 'Weak', color: 'text-orange-600' };
    return { label: 'Very weak', color: 'text-red-600' };
  };

  const connectionStrength = getConnectionStrength();

  return (
    <div className="space-y-6">
      {/* Highlight Cards Grid 3x2 */}
      <div className="grid grid-cols-3 gap-4">
        <DealHighlightCard
          title="Connection strength"
          icon={Building2}
          value={
            <span className={connectionStrength.color}>
              {connectionStrength.label}
            </span>
          }
          subtitle={`${company.contacts_count || 0} contacts`}
        />

        <DealHighlightCard
          title="Next calendar interaction"
          icon={Calendar}
          value="No meetings scheduled"
          subtitle="Schedule a meeting"
        />

        <DealHighlightCard
          title="Team"
          icon={Users}
          value={`${company.contacts_count || 0} people`}
          subtitle="View all contacts"
        />

        <DealHighlightCard
          title="Estimated ARR"
          icon={TrendingUp}
          value={
            <span className="text-success">
              {company.annual_revenue ? formatCurrency(company.annual_revenue) : 'Not set'}
            </span>
          }
          subtitle={company.annual_revenue ? 'Annual recurring revenue' : 'Set ARR estimate'}
        />

        <DealHighlightCard
          title="Funding raised"
          icon={Building2}
          value="Unknown"
          subtitle="Research funding status"
        />

        <DealHighlightCard
          title="Employee range"
          icon={Users}
          value={company.company_size}
          subtitle="Company size"
        />
      </div>

      {/* Recent Activity Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div className="flex-1">
              <p className="text-sm">Company created</p>
              <p className="text-xs text-muted-foreground">
                {new Date(company.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {company.updated_at !== company.created_at && (
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">Company updated</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(company.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {company.last_activity_date && (
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div className="flex-1">
                <p className="text-sm">Last activity</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(company.last_activity_date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {(!company.last_activity_date && company.updated_at === company.created_at) && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground">Activity will appear here as it happens</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};