import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, Globe, Phone, MapPin, Users, TrendingUp, Tag, Link, Award, Search, Loader2, CheckCircle } from "lucide-react";
import { CompanySize, CompanyType, CompanyStatus, CompanyLifecycleStage, CreateCompanyData } from "@/types/Company";
import { useCompanyLookup } from "@/hooks/useCompanyLookup";
import { toast } from "sonner";

interface CompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCompany: (data: CreateCompanyData) => void;
  isCreating?: boolean;
}

const companySizes = [
  { value: "1-10", label: "1-10 empleados" },
  { value: "11-50", label: "11-50 empleados" },
  { value: "51-200", label: "51-200 empleados" },
  { value: "201-500", label: "201-500 empleados" },
  { value: "500+", label: "500+ empleados" }
];

const companyTypes = [
  { value: "prospect", label: "Prospecto", color: "bg-blue-100 text-blue-800" },
  { value: "cliente", label: "Cliente", color: "bg-green-100 text-green-800" },
  { value: "partner", label: "Partner", color: "bg-purple-100 text-purple-800" },
  { value: "franquicia", label: "Franquicia", color: "bg-orange-100 text-orange-800" },
  { value: "competidor", label: "Competidor", color: "bg-red-100 text-red-800" }
];

const companyStatuses = [
  { value: "activa", label: "Activa", color: "bg-green-100 text-green-800" },
  { value: "inactiva", label: "Inactiva", color: "bg-gray-100 text-gray-800" },
  { value: "prospecto", label: "Prospecto", color: "bg-blue-100 text-blue-800" },
  { value: "cliente", label: "Cliente", color: "bg-purple-100 text-purple-800" },
  { value: "perdida", label: "Perdida", color: "bg-red-100 text-red-800" }
];

const lifecycleStages = [
  { value: "lead", label: "Lead", color: "bg-blue-100 text-blue-800" },
  { value: "marketing_qualified_lead", label: "Marketing Qualified Lead", color: "bg-yellow-100 text-yellow-800" },
  { value: "sales_qualified_lead", label: "Sales Qualified Lead", color: "bg-orange-100 text-orange-800" },
  { value: "opportunity", label: "Opportunity", color: "bg-purple-100 text-purple-800" },
  { value: "customer", label: "Customer", color: "bg-green-100 text-green-800" },
  { value: "evangelist", label: "Evangelist", color: "bg-pink-100 text-pink-800" }
];

const industries = [
  "Tecnología",
  "Servicios Financieros", 
  "Consultoría",
  "Inmobiliario",
  "Distribución",
  "Manufactura",
  "Retail",
  "Servicios",
  "Salud",
  "Educación",
  "Energía",
  "Construcción",
  "Alimentación",
  "Otros"
];

export const CompanyModal = ({
  open,
  onOpenChange,
  onCreateCompany,
  isCreating
}: CompanyModalProps) => {
  const [nifSearch, setNifSearch] = useState("");
  const [searchCompleted, setSearchCompleted] = useState(false);
  const { lookupCompany, isLoading: isSearching } = useCompanyLookup();
  
  const [companyData, setCompanyData] = useState<CreateCompanyData>({
    name: "",
    domain: "",
    website: "",
    description: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "España",
    postal_code: "",
    industry: "",
    company_size: "11-50" as CompanySize,
    company_type: "prospect" as CompanyType,
    company_status: "prospecto" as CompanyStatus,
    lifecycle_stage: "lead" as CompanyLifecycleStage,
    annual_revenue: 0,
    founded_year: new Date().getFullYear(),
    owner_id: "",
    is_target_account: false,
    is_key_account: false,
    is_franquicia: false,
    notes: "",
    tags: [],
    lead_score: 0,
    linkedin_url: "",
    twitter_url: "",
    facebook_url: "",
    nif: ""
  });

  const searchByNIF = async () => {
    if (!nifSearch) {
      toast.error('Ingrese un NIF/CIF válido');
      return;
    }

    try {
      const result = await lookupCompany(nifSearch);
      
      if (result.success && result.data) {
        // Update form with found company data
        setCompanyData(prev => ({
          ...prev,
          name: result.data.name || prev.name,
          nif: nifSearch.toUpperCase(),
          industry: result.data.business_sector || prev.industry,
          address: result.data.address_street || prev.address,
          company_status: result.data.status === 'activo' ? 'activa' : 'inactiva',
        }));
        
        setSearchCompleted(true);
        toast.success(`Datos cargados desde ${result.source}`);
      } else {
        toast.error(result.error || 'No se encontraron datos para este NIF');
      }
    } catch (error) {
      console.error('Error searching by NIF:', error);
      toast.error('Error al buscar en eInforma');
    }
  };

  const resetSearch = () => {
    setNifSearch("");
    setSearchCompleted(false);
    setCompanyData(prev => ({ ...prev, nif: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCompany(companyData);
    onOpenChange(false);
    
    // Reset form
    setCompanyData({
      name: "",
      domain: "",
      website: "",
      description: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "España",
      postal_code: "",
      industry: "",
      company_size: "11-50" as CompanySize,
      company_type: "prospect" as CompanyType,
      company_status: "prospecto" as CompanyStatus,
      lifecycle_stage: "lead" as CompanyLifecycleStage,
      annual_revenue: 0,
      founded_year: new Date().getFullYear(),
      owner_id: "",
      is_target_account: false,
      is_key_account: false,
      is_franquicia: false,
      notes: "",
      tags: [],
      lead_score: 0,
      linkedin_url: "",
      twitter_url: "",
      facebook_url: "",
      nif: ""
    });
    resetSearch();
  };

  const updateField = (field: keyof CreateCompanyData, value: any) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-orange-600" />
            Crear Nueva Empresa
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Búsqueda por NIF */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Búsqueda por NIF/CIF (eInforma)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: A12345678 o 12345678Z"
                  value={nifSearch}
                  onChange={(e) => setNifSearch(e.target.value)}
                  disabled={searchCompleted}
                  className="flex-1"
                />
                {!searchCompleted ? (
                  <Button
                    type="button"
                    onClick={searchByNIF}
                    disabled={isSearching || !nifSearch}
                    variant="outline"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Buscar
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={resetSearch}
                    variant="outline"
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Buscar otro
                  </Button>
                )}
              </div>
              
              {searchCompleted && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">
                      Datos cargados desde eInforma. Revise y modifique según sea necesario.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre de la Empresa *</Label>
                <Input
                  id="name"
                  placeholder="ej: ESTRAPEY FINANZA"
                  value={companyData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="nif">NIF/CIF</Label>
                <Input
                  id="nif"
                  placeholder="ej: A12345678"
                  value={companyData.nif}
                  onChange={(e) => updateField("nif", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="domain">Dominio</Label>
                <Input
                  id="domain"
                  placeholder="ej: estrapeyfinanza.com"
                  value={companyData.domain}
                  onChange={(e) => updateField("domain", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="website">Sitio Web</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    placeholder="https://www.empresa.com"
                    value={companyData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Teléfono Principal</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="+34 900 000 000"
                    value={companyData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción de la empresa, servicios, productos..."
                  value={companyData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Clasificación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Clasificación y Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industria</Label>
                <Select value={companyData.industry} onValueChange={(value) => updateField("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar industria" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="company_size">Tamaño de Empresa</Label>
                <Select value={companyData.company_size} onValueChange={(value) => updateField("company_size", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map(size => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="company_type">Tipo de Empresa</Label>
                <Select value={companyData.company_type} onValueChange={(value) => updateField("company_type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="company_status">Estado</Label>
                <Select value={companyData.company_status} onValueChange={(value) => updateField("company_status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companyStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Segmentación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Segmentación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_target_account"
                    checked={companyData.is_target_account}
                    onCheckedChange={(checked) => updateField("is_target_account", checked)}
                  />
                  <Label htmlFor="is_target_account" className="text-sm">
                    Target Account
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_key_account"
                    checked={companyData.is_key_account}
                    onCheckedChange={(checked) => updateField("is_key_account", checked)}
                  />
                  <Label htmlFor="is_key_account" className="text-sm">
                    Key Account
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_franquicia"
                    checked={companyData.is_franquicia}
                    onCheckedChange={(checked) => updateField("is_franquicia", checked)}
                  />
                  <Label htmlFor="is_franquicia" className="text-sm">
                    Franquicia
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Financiera y Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Información Financiera y Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="annual_revenue">Facturación Anual (€)</Label>
                <Input
                  id="annual_revenue"
                  type="number"
                  placeholder="ej: 2000000"
                  value={companyData.annual_revenue || ''}
                  onChange={(e) => updateField("annual_revenue", e.target.value ? Number(e.target.value) : 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="founded_year">Año de Fundación</Label>
                <Input
                  id="founded_year"
                  type="number"
                  placeholder="ej: 2010"
                  value={companyData.founded_year || ''}
                  onChange={(e) => updateField("founded_year", e.target.value ? Number(e.target.value) : new Date().getFullYear())}
                />
              </div>
              
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="city"
                    placeholder="ej: Madrid"
                    value={companyData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="state">Provincia/Estado</Label>
                <Input
                  id="state"
                  placeholder="ej: Madrid"
                  value={companyData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !companyData.name?.trim()}
              className="relative"
            >
              {isCreating ? "Creando..." : "Crear Empresa"}
              <span className="ml-2 text-xs text-muted opacity-60">⌘⇧↩</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};