
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Building2, 
  Users, 
  Handshake,
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
  Star
} from "lucide-react";

interface SearchResult {
  id: string;
  type: 'company' | 'contact' | 'deal' | 'activity';
  title: string;
  subtitle: string;
  description: string;
  metadata: {
    industry?: string;
    location?: string;
    value?: number;
    stage?: string;
    date?: string;
    priority?: 'high' | 'medium' | 'low';
  };
  relevanceScore: number;
}

export const MASearchView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'company' | 'contact' | 'deal' | 'activity'>('all');

  // Datos de ejemplo para la búsqueda
  const sampleData: SearchResult[] = [
    {
      id: '1',
      type: 'company',
      title: 'TechCorp Solutions',
      subtitle: 'Software Development',
      description: 'Empresa líder en desarrollo de software empresarial con presencia en Europa',
      metadata: {
        industry: 'Technology',
        location: 'Madrid, España',
        value: 25000000
      },
      relevanceScore: 95
    },
    {
      id: '2',
      type: 'contact',
      title: 'María González',
      subtitle: 'CEO at InnovaTech',
      description: 'Ejecutiva senior con 15+ años en M&A y finanzas corporativas',
      metadata: {
        industry: 'Technology',
        location: 'Barcelona, España'
      },
      relevanceScore: 88
    },
    {
      id: '3',
      type: 'deal',
      title: 'Adquisición HealthTech Solutions',
      subtitle: 'Buy-side mandate',
      description: 'Mandato de adquisición en el sector de tecnología médica',
      metadata: {
        value: 50000000,
        stage: 'Due Diligence',
        date: '2025-06-15'
      },
      relevanceScore: 92
    },
    {
      id: '4',
      type: 'activity',
      title: 'Reunión con Venture Capital Partners',
      subtitle: 'Meeting',
      description: 'Presentación del pipeline Q2 y oportunidades emergentes',
      metadata: {
        date: '2025-06-28',
        priority: 'high'
      },
      relevanceScore: 78
    }
  ];

  const performSearch = (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simular búsqueda con delay
    setTimeout(() => {
      const filtered = sampleData.filter(item => {
        const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
        const matchesTerm = 
          item.title.toLowerCase().includes(term.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(term.toLowerCase()) ||
          item.description.toLowerCase().includes(term.toLowerCase()) ||
          item.metadata.industry?.toLowerCase().includes(term.toLowerCase());
        
        return matchesFilter && matchesTerm;
      });

      setResults(filtered.sort((a, b) => b.relevanceScore - a.relevanceScore));
      setIsSearching(false);
    }, 500);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedFilter]);

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'company':
        return <Building2 className="h-5 w-5 text-blue-600" />;
      case 'contact':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'deal':
        return <Handshake className="h-5 w-5 text-purple-600" />;
      case 'activity':
        return <Calendar className="h-5 w-5 text-orange-600" />;
      default:
        return <Search className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'company':
        return 'Empresa';
      case 'contact':
        return 'Contacto';
      case 'deal':
        return 'Deal';
      case 'activity':
        return 'Actividad';
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterOptions = [
    { value: 'all', label: 'Todo', icon: Search },
    { value: 'company', label: 'Empresas', icon: Building2 },
    { value: 'contact', label: 'Contactos', icon: Users },
    { value: 'deal', label: 'Deals', icon: Handshake },
    { value: 'activity', label: 'Actividades', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Búsqueda Avanzada M&A</h1>
        <p className="text-gray-600 mt-1">
          Encuentra empresas, contactos, deals y actividades con inteligencia contextual
        </p>
      </div>

      {/* Search Bar */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empresas, contactos, deals..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="px-4">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avanzados
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mt-4">
            {filterOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={selectedFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(option.value as any)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isSearching ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Buscando resultados...</p>
          </CardContent>
        </Card>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {results.length} resultados encontrados
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="h-4 w-4" />
              Ordenado por relevancia
            </div>
          </div>

          {results.map((result) => (
            <Card key={result.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getTypeIcon(result.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{result.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(result.type)}
                          </Badge>
                          {result.relevanceScore > 90 && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              Altamente relevante
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{result.subtitle}</p>
                        <p className="text-sm text-gray-700 mb-3">{result.description}</p>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2">
                          {result.metadata.industry && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Building2 className="h-3 w-3" />
                              {result.metadata.industry}
                            </div>
                          )}
                          {result.metadata.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <MapPin className="h-3 w-3" />
                              {result.metadata.location}
                            </div>
                          )}
                          {result.metadata.value && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(result.metadata.value)}
                            </div>
                          )}
                          {result.metadata.stage && (
                            <Badge variant="outline" className="text-xs">
                              {result.metadata.stage}
                            </Badge>
                          )}
                          {result.metadata.priority && (
                            <Badge className={`${getPriorityColor(result.metadata.priority)} text-xs`}>
                              {result.metadata.priority.toUpperCase()}
                            </Badge>
                          )}
                          {result.metadata.date && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {result.metadata.date}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Relevancia</div>
                          <div className="text-sm font-semibold">{result.relevanceScore}%</div>
                        </div>
                        <Button size="sm" variant="outline">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchTerm ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-600">
              Intenta con otros términos de búsqueda o ajusta los filtros
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Búsqueda Inteligente M&A</h3>
            <p className="text-gray-600 mb-4">
              Utiliza palabras clave como nombres de empresa, sectores, ubicaciones o tipos de deal
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Technology', 'Healthcare', 'Buy-side', 'Due Diligence', 'Madrid'].map((suggestion) => (
                <Badge 
                  key={suggestion}
                  variant="outline" 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSearchTerm(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
