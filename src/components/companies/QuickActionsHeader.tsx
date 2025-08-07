import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  UserPlus,
  FileText,
  Briefcase,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Company } from '@/types/Company';

interface QuickActionsHeaderProps {
  company: Company;
  onEdit: (company: Company) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onCreateLead?: () => void;
  onCreateContact?: () => void;
  onCreateNote?: () => void;
}

export const QuickActionsHeader = ({
  company,
  onEdit,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onCreateLead,
  onCreateContact,
  onCreateNote
}: QuickActionsHeaderProps) => {
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState('');

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      'activa': 'default',
      'cliente': 'default',
      'prospecto': 'secondary',
      'inactiva': 'outline',
      'perdida': 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/empresas?search=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  return (
    <div className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-6 py-4">
        
        {/* Primera fila: Breadcrumb y navegación */}
        <div className="flex items-center justify-between mb-4">
          {/* Breadcrumb y navegación */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/empresas')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Empresas
            </Button>
            
            <span className="text-muted-foreground">&gt;</span>
            
            <span className="font-medium">{company.name}</span>
            
            {/* Navegación anterior/siguiente */}
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={!hasNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick search */}
          <form onSubmit={handleQuickSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar otra empresa..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </form>
        </div>

        {/* Segunda fila: Info empresa y acciones */}
        <div className="flex items-center justify-between">
          {/* Info de la empresa */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {company.industry || 'Industria no especificada'}
                </span>
                {company.city && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{company.city}</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Badges de estado */}
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(company.company_status)}>
                {company.company_status}
              </Badge>
              <Badge variant="outline">{company.company_type}</Badge>
              {company.is_key_account && (
                <Badge variant="outline">Cuenta Clave</Badge>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={onCreateLead}
              className="gap-2"
              size="sm"
            >
              <Briefcase className="h-4 w-4" />
              Crear Lead
            </Button>
            
            <Button 
              onClick={onCreateContact}
              variant="outline"
              className="gap-2"
              size="sm"
            >
              <UserPlus className="h-4 w-4" />
              Nuevo Contacto
            </Button>
            
            <Button 
              onClick={onCreateNote}
              variant="outline"
              className="gap-2"
              size="sm"
            >
              <FileText className="h-4 w-4" />
              Añadir Nota
            </Button>
            
            <Button 
              onClick={() => onEdit(company)}
              variant="ghost"
              className="gap-2"
              size="sm"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};