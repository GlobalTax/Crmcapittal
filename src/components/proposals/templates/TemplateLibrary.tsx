import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProposalTemplates } from '@/hooks/useProposalTemplates';
import { ProposalTemplate } from '@/types/ProposalTemplate';
import { Search, Copy, Edit, Eye, Trash2, Plus, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TemplateLibraryProps {
  onSelectTemplate?: (template: ProposalTemplate) => void;
  onEditTemplate?: (template: ProposalTemplate) => void;
  onCreateNew?: () => void;
  showActions?: boolean;
}

const CATEGORY_COLORS = {
  'M&A': 'bg-blue-100 text-blue-800',
  'Valoracion': 'bg-green-100 text-green-800',
  'Consultoria': 'bg-purple-100 text-purple-800',
  'Due Diligence': 'bg-orange-100 text-orange-800',
  'Legal': 'bg-gray-100 text-gray-800'
};

export const TemplateLibrary = ({ 
  onSelectTemplate, 
  onEditTemplate,
  onCreateNew,
  showActions = true 
}: TemplateLibraryProps) => {
  const { templates, loading, duplicateTemplate, deleteTemplate } = useProposalTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'recent'>('usage');

  const filteredAndSortedTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usage_count - a.usage_count;
        case 'recent':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

  const handleDuplicate = async (template: ProposalTemplate) => {
    await duplicateTemplate(template);
  };

  const handleDelete = async (template: ProposalTemplate) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el template "${template.name}"?`)) {
      await deleteTemplate(template.id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Biblioteca de Templates</h2>
          <p className="text-muted-foreground">
            Crea propuestas profesionales en minutos usando templates optimizados
          </p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Crear Template
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="M&A">M&A</SelectItem>
            <SelectItem value="Valoracion">Valoración</SelectItem>
            <SelectItem value="Consultoria">Consultoría</SelectItem>
            <SelectItem value="Due Diligence">Due Diligence</SelectItem>
            <SelectItem value="Legal">Legal</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usage">Más usados</SelectItem>
            <SelectItem value="recent">Más recientes</SelectItem>
            <SelectItem value="name">Nombre A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {filteredAndSortedTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              {searchQuery || categoryFilter !== 'all' 
                ? 'No se encontraron templates con los filtros aplicados'
                : 'No hay templates disponibles'}
            </div>
            {onCreateNew && (
              <Button onClick={onCreateNew} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Crear el primer template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold mb-2">
                      {template.name}
                    </CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={CATEGORY_COLORS[template.category]}
                    >
                      {template.category}
                    </Badge>
                  </div>
                  {template.is_default && (
                    <Badge variant="outline" className="text-xs">
                      Por defecto
                    </Badge>
                  )}
                </div>
                
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{template.usage_count} usos</span>
                  </div>
                  <div>
                    {template.success_rate > 0 && (
                      <span>{template.success_rate}% éxito</span>
                    )}
                  </div>
                </div>

                {showActions && (
                  <div className="flex gap-2">
                    {onSelectTemplate && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-primary text-primary-foreground"
                        onClick={() => onSelectTemplate(template)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Usar
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    
                    {onEditTemplate && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onEditTemplate(template)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(template)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};