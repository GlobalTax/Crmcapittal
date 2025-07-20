import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Building2, ChevronDown, Filter, Settings, Plus, Users, Briefcase } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Company } from '@/types/Company';
import { EmptyStateSmall } from '@/components/ui/EmptyStateSmall';
import { calculateProfileScore, formatRevenue, formatLocation } from '@/utils/profileScore';

interface RecordTableProps {
  companies: (Company & { 
    enrichment_data?: any; 
    contacts_count?: number; 
    opportunities_count?: number;
    sector?: string;
  })[];
  totalCount: number;
  onRowClick?: (company: Company) => void;
  onCreateCompany?: () => void;
  onSearch?: (term: string) => void;
  onFilter?: () => void;
  isLoading?: boolean;
}

export const RecordTable = ({
  companies,
  totalCount,
  onRowClick,
  onCreateCompany,
  onSearch,
  onFilter,
  isLoading
}: RecordTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [savedView, setSavedView] = useState('All companies');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      prospecto: 'hsl(213, 94%, 68%)', // #1E88E5
      cliente: 'hsl(158, 100%, 38%)', // #00C48C  
      perdida: 'hsl(4, 86%, 63%)' // #EF5350
    };
    return colors[status as keyof typeof colors] || 'hsl(220, 9%, 46%)';
  };

  if (companies.length === 0 && !isLoading) {
    return (
      <div className="bg-neutral-0 rounded-lg border border-border">
        <div className="p-6">
          <EmptyStateSmall
            icon={<Building2 className="w-5 h-5 text-primary" />}
            text="No companies yet"
            action={<Button onClick={onCreateCompany}>+ New company</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-0 rounded-lg border border-border">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Saved Views Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 text-sm font-medium">
                {savedView}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setSavedView('All companies')}>
                All companies
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSavedView('My companies')}>
                My companies
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSavedView('Target accounts')}>
                Target accounts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-64 h-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onFilter}>
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            View settings
          </Button>
          <Button onClick={onCreateCompany}>
            + New company
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Company</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Sector</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Location</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Revenue</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Contacts</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Opportunities</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Profile</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const profileScore = calculateProfileScore(
                company, 
                company.enrichment_data, 
                company.contacts_count || 0, 
                company.opportunities_count || 0
              );
              
              return (
                <tr
                  key={company.id}
                  className="border-b border-border hover:bg-neutral-50 cursor-pointer"
                  onClick={() => onRowClick?.(company)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-xs">
                          {getInitials(company.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{company.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {company.domain || 'No domain'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      {company.sector || company.industry || '—'}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      {formatLocation(company.city, company.state)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      {formatRevenue(company.annual_revenue || company.enrichment_data?.company_data?.revenue)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {company.contacts_count || 0}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Briefcase className="h-3 w-3 text-muted-foreground" />
                      {company.opportunities_count || 0}
                    </div>
                  </td>
                  <td className="p-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{profileScore.icon}</span>
                            <span className={`text-xs font-medium ${profileScore.color}`}>
                              {profileScore.score}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1 text-xs">
                            <div>Basic Info: {profileScore.details.basicInfo}/25</div>
                            <div>Contact Info: {profileScore.details.contactInfo}/20</div>
                            <div>Business Info: {profileScore.details.businessInfo}/30</div>
                            <div>Relationships: {profileScore.details.relationshipData}/25</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border text-sm text-muted-foreground">
        <div>{totalCount} companies</div>
      </div>
    </div>
  );
};