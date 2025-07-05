import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown, Filter, Settings, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Company } from '@/types/Company';
import { EmptyStateSmall } from '@/components/ui/EmptyStateSmall';

interface RecordTableProps {
  companies: Company[];
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
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Stage</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Owner</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">ARR</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Employees</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">+ Add column</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
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
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: getStatusBadge(company.company_status),
                      color: getStatusBadge(company.company_status)
                    }}
                  >
                    {company.company_status === 'prospecto' ? 'Prospect' : 
                     company.company_status === 'cliente' ? 'Customer' : 
                     company.company_status === 'perdida' ? 'Churned' : company.company_status}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="text-sm">{company.owner_name || 'Unassigned'}</div>
                </td>
                <td className="p-3">
                  <div className="text-sm">
                    {company.annual_revenue 
                      ? `€${(company.annual_revenue / 1000).toFixed(0)}K`
                      : '—'
                    }
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-sm">{company.company_size}</div>
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Plus className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
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