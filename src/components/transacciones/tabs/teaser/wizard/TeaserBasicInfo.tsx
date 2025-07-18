import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shuffle } from 'lucide-react';

interface TeaserBasicInfoProps {
  data: any;
  onChange: (field: string, value: any) => void;
  transaccion: any;
}

const SECTOR_TEMPLATES: Record<string, string[]> = {
  'tecnologia': ['TechCorp', 'InnovaSoft', 'DigitalPlus', 'SoftTech', 'DataSystems'],
  'manufactura': ['IndustrialCorp', 'ManufacPlus', 'ProductionCo', 'IndustriaX', 'FabricaTech'],
  'servicios': ['ServiciosPro', 'ConsultingPlus', 'ServiceCorp', 'ExpertGroup', 'SolutionsCo'],
  'retail': ['ComercialPlus', 'RetailCorp', 'VentasPro', 'ComercioX', 'DistribuidoraCo'],
  'healthcare': ['MedicalCorp', 'HealthPlus', 'SaludTech', 'ClinicalGroup', 'BioMedical'],
  'inmobiliario': ['PropiedadesCorp', 'InmobiliariaPlus', 'UrbanTech', 'RealEstateCo', 'PropTech'],
  'alimentacion': ['FoodCorp', 'AlimentosPlus', 'GastroTech', 'NutriCorp', 'FoodTech'],
  'automocion': ['AutoCorp', 'MotorPlus', 'VehicleTech', 'AutoIndustrial', 'MobilityTech'],
  'default': ['EmpresaLíder', 'CorporaciónX', 'GrupoIndustrial', 'CompañíaPro', 'OrganizaciónPlus']
};

export function TeaserBasicInfo({ data, onChange, transaccion }: TeaserBasicInfoProps) {
  const generateAnonymousName = () => {
    const sectorKey = data.sector?.toLowerCase() || 'default';
    const names = SECTOR_TEMPLATES[sectorKey] || SECTOR_TEMPLATES.default;
    const randomName = names[Math.floor(Math.random() * names.length)];
    const location = data.location || 'España';
    onChange('anonymous_company_name', `${randomName} (${location})`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Identificación del Teaser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título del Teaser *</Label>
            <Input
              id="title"
              value={data.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="Título interno del teaser"
            />
          </div>

          <div>
            <Label htmlFor="status">Estado del Teaser</Label>
            <Select value={data.status || 'borrador'} onValueChange={(value) => onChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="revision">En Revisión</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información Pública</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="anonymous_name">Nombre Anónimo de la Empresa *</Label>
            <div className="flex gap-2">
              <Input
                id="anonymous_name"
                value={data.anonymous_company_name || ''}
                onChange={(e) => onChange('anonymous_company_name', e.target.value)}
                placeholder="Nombre público de la empresa"
              />
              <Button 
                variant="outline" 
                onClick={generateAnonymousName}
                type="button"
                className="px-3"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Este será el nombre visible para los potenciales compradores
            </p>
          </div>

          <div>
            <Label htmlFor="sector">Sector de Actividad</Label>
            <Input
              id="sector"
              value={data.sector || ''}
              onChange={(e) => onChange('sector', e.target.value)}
              placeholder="ej. Tecnología, Manufactura, Servicios"
            />
          </div>

          <div>
            <Label htmlFor="location">Ubicación Geográfica</Label>
            <Input
              id="location"
              value={data.location || ''}
              onChange={(e) => onChange('location', e.target.value)}
              placeholder="ej. Madrid, Barcelona, España"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Configuración Avanzada</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="currency">Moneda</Label>
            <Select value={data.currency || 'EUR'} onValueChange={(value) => onChange('currency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="USD">Dólar ($)</SelectItem>
                <SelectItem value="GBP">Libra (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expires_at">Fecha de Expiración</Label>
            <Input
              id="expires_at"
              type="date"
              value={data.expires_at ? new Date(data.expires_at).toISOString().split('T')[0] : ''}
              onChange={(e) => onChange('expires_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
            />
          </div>

          <div>
            <Label htmlFor="project_code">Código del Proyecto</Label>
            <Input
              id="project_code"
              value={data.project_code || `TXN-${transaccion.id?.slice(0, 8) || 'NEW'}`}
              onChange={(e) => onChange('project_code', e.target.value)}
              placeholder="Código único del proyecto"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}