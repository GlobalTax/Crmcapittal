export interface EInformaCredentials {
  apiKey: string;
  baseUrl: string;
}

export interface EInformaCompanyBasic {
  cif: string;
  razon_social: string;
  direccion: string;
  codigo_postal: string;
  poblacion: string;
  provincia: string;
  telefono?: string;
  email?: string;
  web?: string;
  fecha_constitucion?: string;
  capital_social?: number;
  forma_juridica?: string;
  situacion_juridica?: string;
  actividad_principal?: string;
  cnae?: string;
}

export interface EInformaFinancialData {
  cif: string;
  ejercicio: number;
  fecha_cierre: string;
  ingresos_explotacion?: number;
  resultado_explotacion?: number;
  resultado_ejercicio?: number;
  activo_total?: number;
  patrimonio_neto?: number;
  pasivo_total?: number;
  empleados?: number;
  rating_crediticio?: string;
  scoring?: number;
}

export interface EInformaDirector {
  nombre: string;
  apellidos: string;
  cargo: string;
  fecha_nombramiento?: string;
  fecha_cese?: string;
  dni?: string;
  nacionalidad?: string;
}

export interface EInformaCompanyFull extends EInformaCompanyBasic {
  datos_financieros?: EInformaFinancialData[];
  directivos?: EInformaDirector[];
  vinculos_societarios?: EInformaVinculo[];
  fecha_ultima_actualizacion?: string;
}

export interface EInformaVinculo {
  cif_vinculado: string;
  razon_social_vinculado: string;
  tipo_vinculo: 'matriz' | 'filial' | 'participada' | 'participante';
  porcentaje_participacion?: number;
}

export interface EInformaSearchResult {
  cif: string;
  razon_social: string;
  poblacion: string;
  provincia: string;
  puntuacion_coincidencia: number;
}

export interface EInformaApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  rate_limit?: {
    remaining: number;
    reset_time: string;
  };
}

export interface EInformaEnrichmentResult {
  company_data?: EInformaCompanyFull;
  financial_data?: EInformaFinancialData[];
  directors?: EInformaDirector[];
  enrichment_date: string;
  source: 'einforma';
  confidence_score: number;
}