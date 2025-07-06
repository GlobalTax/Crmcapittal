import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon } from 'lucide-react';
import { useCompanyLookup, CompanyData } from '@/hooks/useCompanyLookup';

interface NifLookupProps {
  onCompanyFound?: (company: CompanyData) => void;
  onNifChange?: (nif: string) => void;
  initialNif?: string;
  autoFillForm?: boolean;
  className?: string;
}

export const NifLookup = ({ 
  onCompanyFound, 
  onNifChange, 
  initialNif = '',
  autoFillForm = true,
  className = ''
}: NifLookupProps) => {
  const [nif, setNif] = useState(initialNif);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isValidFormat, setIsValidFormat] = useState(false);
  
  const { lookupCompany, validateNIF, isLoading, error } = useCompanyLookup();

  // Real-time validation
  useEffect(() => {
    const isValid = nif.length > 0 && validateNIF(nif);
    setIsValidFormat(isValid);
  }, [nif, validateNIF]);

  const handleNifChange = (value: string) => {
    setNif(value.toUpperCase());
    onNifChange?.(value.toUpperCase());
    
    // Clear previous results when NIF changes
    if (companyData) {
      setCompanyData(null);
    }
  };

  const handleLookup = async () => {
    if (!isValidFormat) {
      return;
    }

    const result = await lookupCompany(nif);
    
    if (result.success && result.data) {
      setCompanyData(result.data);
      if (onCompanyFound) {
        onCompanyFound(result.data);
      }
    } else {
      setCompanyData(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidFormat) {
      handleLookup();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="nif">NIF/CIF</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="nif"
              type="text"
              placeholder="Ej: B12345678, 12345678Z"
              value={nif}
              onChange={(e) => handleNifChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`
                ${isValidFormat && nif.length > 0 ? 'border-green-500' : ''}
                ${!isValidFormat && nif.length > 0 ? 'border-red-500' : ''}
              `}
            />
            {nif.length > 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isValidFormat ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircleIcon className="h-4 w-4 text-red-500" />
                )}
              </div>
            )}
          </div>
          <Button 
            onClick={handleLookup}
            disabled={!isValidFormat || isLoading}
            variant="outline"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Buscando...
              </>
            ) : (
              <>
                <SearchIcon className="h-4 w-4 mr-2" />
                Buscar
              </>
            )}
          </Button>
        </div>
        
        {/* Format validation feedback */}
        {nif.length > 0 && !isValidFormat && (
          <p className="text-sm text-red-600">
            Formato inválido. Introduce un NIF/CIF válido (ej: B12345678, 12345678Z)
          </p>
        )}
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Company data display */}
      {companyData && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">Empresa encontrada:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Razón Social:</strong> {companyData.name}
                </div>
                <div>
                  <strong>NIF/CIF:</strong> {companyData.nif}
                </div>
                {companyData.address_street && (
                  <div>
                    <strong>Dirección:</strong> {companyData.address_street}
                  </div>
                )}
                {companyData.address_city && (
                  <div>
                    <strong>Ciudad:</strong> {companyData.address_city}
                  </div>
                )}
                {companyData.address_postal_code && (
                  <div>
                    <strong>Código Postal:</strong> {companyData.address_postal_code}
                  </div>
                )}
                {companyData.business_sector && (
                  <div>
                    <strong>Sector:</strong> {companyData.business_sector}
                  </div>
                )}
                {companyData.legal_representative && (
                  <div>
                    <strong>Representante Legal:</strong> {companyData.legal_representative}
                  </div>
                )}
                <div>
                  <strong>Estado:</strong> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    companyData.status === 'activo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {companyData.status}
                  </span>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};