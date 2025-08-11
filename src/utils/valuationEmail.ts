// Utilidades para envío de valoración por email y subida de PDF a Storage
// Nota: No modifica helpers existentes; se añade un módulo reutilizable.

import { supabase } from "@/integrations/supabase/client";

export type CompanyData = {
  contactName: string;
  companyName: string;
  email: string;
  phone?: string;
  industry?: string;
  revenue?: number;
  ebitda?: number;
};

export type ValuationResult = {
  finalValuation: number;
  multiples?: { ebitdaMultipleUsed?: number };
  valuationRange?: { min: number; max: number };
};

/**
 * Sube un Blob PDF al bucket público `valuations` y devuelve su URL pública
 */
export async function uploadPdfGetUrl(pdfBlob: Blob, baseName: string) {
  const safe = `${baseName.toLowerCase().replace(/[^a-z0-9\-]+/g, "-")}-${Date.now()}.pdf`;
  const path = `emails/${safe}`; // Bucket: valuations

  const { error: upErr } = await supabase.storage
    .from("valuations")
    .upload(path, pdfBlob, { contentType: "application/pdf", upsert: false });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from("valuations").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Invoca la Edge Function `send-valuation-email`.
 * Soporta el nuevo payload con companyData/result y pdfUrl (opcional).
 */
export async function sendValuationEmail(params: {
  companyData: CompanyData;
  result: ValuationResult;
  pdfUrl?: string;
}) {
  const { data, error } = await supabase.functions.invoke("send-valuation-email", {
    body: {
      companyData: params.companyData,
      result: params.result,
      pdf_url: params.pdfUrl,
    },
  });
  if (error) throw error;
  return data;
}
