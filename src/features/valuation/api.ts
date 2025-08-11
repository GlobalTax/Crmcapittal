// Helpers para la landing de valoración: subir PDF y enviar email
// Se adaptan a la Edge Function existente `send-valuation-email` que espera { email, name?, link }

import { supabase } from '@/integrations/supabase/client';

export type CompanyData = {
  contactName: string;
  companyName: string;
  email: string;
  phone?: string;
  industry?: string;
  revenue?: number;
  ebitda?: number;
};

// Sube un Blob PDF al bucket público `valuations` y devuelve su URL pública
export async function uploadPdfGetUrl(pdfBlob: Blob, baseName: string) {
  const safeBase = baseName.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
  const filename = `${safeBase}-${Date.now()}.pdf`;
  const path = `emails/${filename}`; // carpeta lógica dentro del bucket

  const { error: upErr } = await supabase.storage
    .from('valuations')
    .upload(path, pdfBlob, { contentType: 'application/pdf', upsert: false });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from('valuations').getPublicUrl(path);
  return data.publicUrl;
}

// Invoca la Edge Function `send-valuation-email`
// Nota: La función espera un `link` (URL del PDF) y campos `email` y `name` opcionales
export async function sendValuationEmail(params: { email: string; name?: string; link: string }) {
  const { data, error } = await supabase.functions.invoke('send-valuation-email', {
    body: {
      email: params.email,
      name: params.name,
      link: params.link,
    },
  });
  if (error) throw error;
  return data;
}

// Ejemplo de uso (para integrar cuando tengas el cálculo y el PDF generado)
// async function onCalculationComplete(company: CompanyData, pdfBlob: Blob) {
//   const pdfUrl = await uploadPdfGetUrl(pdfBlob, company.companyName);
//   await sendValuationEmail({ email: company.email, name: company.contactName, link: pdfUrl });
// }
