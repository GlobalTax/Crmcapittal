import { useState, useEffect } from 'react';
import { Search, Users, Building2, Briefcase, FileText, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'contact' | 'company' | 'negocio' | 'document' | 'navigation';
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock search results - in a real app, this would come from your API
const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Juan Pérez',
    subtitle: 'Director General - TechCorp',
    type: 'contact',
    url: '/contacts',
    icon: Users,
  },
  {
    id: '2',
    title: 'TechCorp Solutions',
    subtitle: 'Empresa de tecnología',
    type: 'company',
    url: '/companies',
    icon: Building2,
  },
  {
    id: '3',
    title: 'Adquisición StartupXYZ',
    subtitle: 'Negocio en proceso - €2.5M',
    type: 'negocio',
    url: '/negocios',
    icon: Briefcase,
  },
  {
    id: '4',
    title: 'Propuesta Q1 2024',
    subtitle: 'Documento actualizado hace 2 días',
    type: 'document',
    url: '/documents',
    icon: FileText,
  },
];

const navigationResults: SearchResult[] = [
  {
    id: 'nav-1',
    title: 'Dashboard',
    subtitle: 'Vista principal del sistema',
    type: 'navigation',
    url: '/',
    icon: Clock,
  },
  {
    id: 'nav-2',
    title: 'Contactos',
    subtitle: 'Gestión de contactos',
    type: 'navigation',
    url: '/contacts',
    icon: Users,
  },
  {
    id: 'nav-3',
    title: 'Empresas',
    subtitle: 'Base de datos de empresas',
    type: 'navigation',
    url: '/companies',
    icon: Building2,
  },
  {
    id: 'nav-4',
    title: 'Negocios',
    subtitle: 'Pipeline de oportunidades',
    type: 'navigation',
    url: '/negocios',
    icon: Briefcase,
  },
];

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  // Filter results based on search query
  useEffect(() => {
    if (searchQuery.length === 0) {
      setResults(navigationResults);
    } else {
      const filtered = [...mockResults, ...navigationResults].filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    }
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onOpenChange(false);
    setSearchQuery('');
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'contact': return 'Contacto';
      case 'company': return 'Empresa';
      case 'negocio': return 'Negocio';
      case 'document': return 'Documento';
      case 'navigation': return 'Navegación';
      default: return 'Resultado';
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'contact': return 'text-blue-600 bg-blue-50';
      case 'company': return 'text-green-600 bg-green-50';
      case 'negocio': return 'text-purple-600 bg-purple-50';
      case 'document': return 'text-orange-600 bg-orange-50';
      case 'navigation': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="border-b border-neutral-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar contactos, empresas, negocios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-0 bg-neutral-100/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <Button
                    key={result.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 mb-1"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 rounded-lg bg-neutral-100">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm text-neutral-900">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-xs text-gray-500">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                        {getTypeLabel(result.type)}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {searchQuery ? 'No se encontraron resultados' : 'Comienza a escribir para buscar...'}
              </p>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="border-t border-neutral-100 p-3 bg-neutral-100/30">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Usa ↑↓ para navegar, Enter para seleccionar</span>
              <span>{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}