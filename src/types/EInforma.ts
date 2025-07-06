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

export interface EInformaBalanceSheet {
  cif: string;
  ejercicio: number;
  fecha_cierre: string;
  activo_corriente?: number;
  activo_no_corriente?: number;
  activo_total?: number;
  pasivo_corriente?: number;
  pasivo_no_corriente?: number;
  pasivo_total?: number;
  patrimonio_neto?: number;
  fondos_propios?: number;
  capital_social?: number;
  reservas?: number;
  resultado_ejercicio?: number;
}

export interface EInformaIncomeStatement {
  cif: string;
  ejercicio: number;
  fecha_cierre: string;
  ingresos_explotacion?: number;
  consumos_materias_primas?: number;
  gastos_personal?: number;
  otros_gastos_explotacion?: number;
  amortizaciones?: number;
  resultado_explotacion?: number;
  ingresos_financieros?: number;
  gastos_financieros?: number;
  resultado_financiero?: number;
  resultado_antes_impuestos?: number;
  impuesto_sociedades?: number;
  resultado_ejercicio?: number;
  ebitda?: number;
}

export interface EInformaRatios {
  cif: string;
  ejercicio: number;
  rentabilidad: {
    roe?: number; // Return on Equity
    roa?: number; // Return on Assets
    roi?: number; // Return on Investment
    margen_bruto?: number;
    margen_neto?: number;
  };
  liquidez: {
    ratio_corriente?: number;
    ratio_rapido?: number;
    ratio_tesoreria?: number;
    capital_trabajo?: number;
  };
  endeudamiento: {
    ratio_endeudamiento?: number;
    ratio_autonomia?: number;
    cobertura_intereses?: number;
    deuda_corto_plazo?: number;
    deuda_largo_plazo?: number;
  };
  eficiencia: {
    rotacion_activos?: number;
    rotacion_inventarios?: number;
    periodo_medio_cobro?: number;
    periodo_medio_pago?: number;
  };
}

export interface EInformaCreditInfo {
  cif: string;
  fecha_consulta: string;
  rating_crediticio?: string;
  scoring_crediticio?: number;
  limite_credito_recomendado?: number;
  nivel_riesgo?: 'bajo' | 'medio' | 'alto' | 'muy_alto';
  incidencias: {
    protestos?: number;
    impagados?: number;
    concursos?: number;
    embargos?: number;
    fecha_ultima_incidencia?: string;
  };
  historial_consultas?: {
    total_consultas_6m?: number;
    total_consultas_12m?: number;
    consultas_recientes?: Array<{
      fecha: string;
      tipo_consulta: string;
      entidad_consultante?: string;
    }>;
  };
  evolucion_rating?: Array<{
    fecha: string;
    rating: string;
    scoring: number;
  }>;
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
  balance_sheet?: EInformaBalanceSheet[];
  income_statement?: EInformaIncomeStatement[];
  financial_ratios?: EInformaRatios[];
  credit_info?: EInformaCreditInfo;
  directors?: EInformaDirector[];
  enrichment_date: string;
  source: 'einforma';
  confidence_score: number;
}