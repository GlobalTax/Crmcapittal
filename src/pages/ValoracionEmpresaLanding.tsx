import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uploadPdfGetUrl, sendValuationEmail, type CompanyData, type ValuationResult } from '@/utils/valuationEmail';

// =====================
// SEO
// =====================
const setSeo = () => {
  const title = 'Calculadora de Valoración y Fiscalidad | Capittal';
  const desc = 'Calcula gratis la valoración orientativa y el impacto fiscal de la venta de tu empresa en España. Recibe un informe PDF por email.';
  document.title = title;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', desc); else {
    const m = document.createElement('meta'); m.name = 'description'; m.content = desc; document.head.appendChild(m);
  }
  const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  const href = window.location.origin + '/lp/valoraciones';
  if (canonical) canonical.href = href; else { const l = document.createElement('link'); l.rel = 'canonical'; l.href = href; document.head.appendChild(l); }
  // JSON-LD
  const prevLd = document.getElementById('ld-json-valuation');
  if (prevLd) prevLd.remove();
  const ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'ld-json-valuation';
  ld.text = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WebPage',
    name: title, url: href, description: desc,
    publisher: { '@type': 'Organization', name: 'Capittal' }
  });
  document.head.appendChild(ld);
};

// =====================
// Tipos y opciones
// =====================
const sectors = [
  'Tecnología','Industria','Servicios','Consumo','Salud','Construcción','Energía','Finanzas'
];
const employeeRanges = ['1-10', '11-50', '51-200', '201-500', '500+'];

// =====================
// Validación (Zod)
// =====================
const schema = z.object({
  // Paso 1
  full_name: z.string().min(2, 'Introduce tu nombre'),
  company: z.string().min(2, 'Introduce el nombre de tu empresa'),
  cif: z.string().regex(/^[A-Za-z0-9]{8,10}$/,{ message: 'Formato CIF/NIF no válido' }),
  email: z.string().email('Introduce un email válido'),
  phone: z.string().optional(),
  sector: z.string().min(1,'Selecciona un sector'),
  years_active: z.coerce.number({ invalid_type_error: 'Introduce un número válido' }).int('Introduce un número válido').min(0, 'Introduce un número válido'),
  employees: z.string().min(1, 'Selecciona un rango'),
  location: z.string().min(2, 'Este campo es obligatorio'),
  // Paso 2
  revenue: z.coerce.number({ invalid_type_error: 'Introduce un importe válido' }).nonnegative('Introduce un importe válido'),
  ebitda: z.coerce.number({ invalid_type_error: 'Introduce un importe válido' }).nonnegative('Introduce un importe válido'),
  net_margin: z.coerce.number({ invalid_type_error: 'Introduce un porcentaje válido' }).min(0,'Introduce un valor entre 0 y 100').max(100,'Introduce un valor entre 0 y 100'),
  growth: z.coerce.number({ invalid_type_error: 'Introduce un porcentaje válido' }).min(0,'Introduce un valor entre 0 y 100').max(100,'Introduce un valor entre 0 y 100'),
  // Paso 3
  participation: z.string().min(1, 'Este campo es obligatorio'),
  advantage: z.string().min(10, 'Cuéntanos brevemente la ventaja competitiva'),
  // Consentimiento
  consent: z.literal(true, { errorMap: () => ({ message: 'Acepta el consentimiento para continuar' }) }),
});

type FormValues = z.infer<typeof schema>;

// =====================
// Tracking helper (Supabase)
// =====================
async function trackEvent(event_name: string, payload: any = {}, step?: number, session_id?: string) {
  try {
    await supabase.from('valuation_events').insert({
      event_name,
      payload,
      step,
      session_id,
      user_agent: navigator.userAgent
    });
  } catch (e) {
    // No bloquear UX por tracking
    console.warn('tracking error', e);
  }
}

// =====================
// Cálculo simple de valoración (placeholder)
// =====================
function computeValuation(values: Pick<FormValues, 'ebitda'|'sector'>): { min: number; max: number; final: number; multiple: number } {
  // Múltiplo base por sector (aprox.)
  const base: Record<string, number> = {
    'Tecnología': 7.5, 'Industria': 5.5, 'Servicios': 5.0, 'Consumo': 6.0,
    'Salud': 7.0, 'Construcción': 4.5, 'Energía': 6.5, 'Finanzas': 6.0,
  };
  const mult = base[values.sector] ?? 5.5;
  const final = values.ebitda * mult;
  const min = final * 0.85;
  const max = final * 1.15;
  return { min, max, final, multiple: mult };
}

// =====================
// PDF (lazy)
// =====================
async function generatePdfBlob(values: FormValues, res: { min:number; max:number; final:number; multiple:number }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Valoración estimada — Capittal', 14, 20);
  doc.setFontSize(11);
  doc.text(`Empresa: ${values.company}`, 14, 30);
  doc.text(`Contacto: ${values.full_name} — ${values.email}`, 14, 37);
  doc.text(`Sector: ${values.sector} — Empleados: ${values.employees}`, 14, 44);
  doc.text(`Ubicación: ${values.location} — Años en activo: ${values.years_active}`, 14, 51);
  doc.text('Resultado:', 14, 66);
  doc.text(`Múltiplo EBITDA aplicado: ${res.multiple.toFixed(1)}x`, 14, 74);
  doc.text(`Rango orientativo: €${Math.round(res.min).toLocaleString('es-ES')} – €${Math.round(res.max).toLocaleString('es-ES')}`, 14, 81);
  doc.text(`Valoración final estimada: €${Math.round(res.final).toLocaleString('es-ES')}`, 14, 88);
  doc.setFontSize(9);
  doc.text('Estimación orientativa no vinculante. Sujeta a verificación y análisis detallado.', 14, 105);
  return doc.output('blob');
}

// =====================
// Página principal (Wizard 4 pasos)
// =====================
export default function ValoracionEmpresaLanding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1|2|3|4>(1);
  const [calculating, setCalculating] = useState(false);
  const [sending, setSending] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [result, setResult] = useState<{ min:number; max:number; final:number; multiple:number } | null>(null);

  const sessionId = useMemo(() => {
    try {
      const k = 'valuation_session_id';
      const prev = localStorage.getItem(k);
      if (prev) return prev;
      const id = crypto.randomUUID?.() ?? String(Date.now());
      localStorage.setItem(k, id);
      return id;
    } catch { return String(Date.now()); }
  }, []);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sector: '', employees: '', participation: '', advantage: '', consent: false,
    } as any,
  });

  useEffect(() => { setSeo(); }, []);

  // Navegación de pasos
  const goTo = async (target: 1|2|3|4) => {
    // Validar paso actual antes de avanzar
    const fieldGroups: Record<number, (keyof FormValues)[]> = {
      1: ['full_name','company','cif','email','sector','years_active','employees','location'],
      2: ['revenue','ebitda','net_margin','growth'],
      3: ['participation','advantage','consent'],
      4: [],
    };
    const currentFields = fieldGroups[Math.min(step, target)];
    const ok = await trigger(currentFields as any);
    if (!ok && target > step) {
      toast.error('Parece que falta información clave. Completa los campos resaltados para continuar.');
      await trackEvent('valuation_validation_issue', { fields: currentFields.filter(f => (errors as any)[f]) }, step, sessionId);
      return;
    }
    setStep(target);
    trackEvent('valuation_step_change', { step: target }, target, sessionId);
  };

  // Calcular valoración (paso 3 → 4)
  const onCalculate = handleSubmit(async (values) => {
    try {
      setCalculating(true);
      trackEvent('valuation_calculation_start', {}, 3, sessionId);
      toast.loading('Calculando valoración…', { id: 'calc' });
      const res = computeValuation({ ebitda: values.ebitda, sector: values.sector });
      setResult(res);
      toast.success('¡Listo! Hemos calculado tu valoración.', { id: 'calc' });
      trackEvent('valuation_calculation_complete', { valuation: { finalValuation: res.final, rangeMin: res.min, rangeMax: res.max, ebitdaMultiple: res.multiple } }, 4, sessionId);
      setStep(4);
    } catch (e) {
      console.error(e);
      toast.error('No hemos podido calcular la valoración. Revisa los datos e inténtalo de nuevo.', { id: 'calc' });
    } finally {
      setCalculating(false);
    }
  });

  // Descargar PDF
  const handleDownloadPdf = handleSubmit(async (values) => {
    if (!result) return;
    try {
      setPdfGenerating(true);
      toast.loading('Generando informe PDF…', { id: 'pdf' });
      const blob = await generatePdfBlob(values, result);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `capittal-valoracion-${values.company}.pdf`; a.click();
      URL.revokeObjectURL(url);
      trackEvent('valuation_pdf_generated', { size: blob.size }, 4, sessionId);
      toast.success('PDF listo para descargar.', { id: 'pdf' });
    } catch (e) {
      console.error(e);
      toast.error('No se pudo generar el PDF. Vuelve a intentarlo.', { id: 'pdf' });
    } finally {
      setPdfGenerating(false);
    }
  });

  // Enviar informe por email (con PDF subido opcional)
  const handleSendEmail = handleSubmit(async (values) => {
    if (!result) return;
    if (sending) return;
    try {
      setSending(true);
      toast.loading(`Enviando informe a ${values.email}…`, { id: 'email' });
      trackEvent('valuation_email_send_start', { email: values.email }, 4, sessionId);

      // Preparar datos
      const companyData: CompanyData = {
        contactName: values.full_name,
        companyName: values.company,
        email: values.email,
        phone: values.phone,
        industry: values.sector,
        revenue: values.revenue,
        ebitda: values.ebitda,
      } as any;
      const vResult: ValuationResult = {
        finalValuation: result.final,
        valuationRange: { min: result.min, max: result.max },
        multiples: { ebitdaMultipleUsed: result.multiple },
      };

      // Generar y subir PDF
      let pdfUrl: string | undefined;
      try {
        const blob = await generatePdfBlob(values, result);
        pdfUrl = await uploadPdfGetUrl(blob, values.company);
      } catch (e) {
        console.warn('PDF upload failed, sending without link', e);
      }

      const resp = await sendValuationEmail({ companyData, result: vResult, pdfUrl });
      toast.success('Informe enviado. Revisa tu bandeja (y spam) — remitente: informes@capittal.es', { id: 'email' });
      trackEvent('valuation_email_send_success', { email: values.email, messageId: (resp as any)?.id }, 4, sessionId);
    } catch (e: any) {
      console.error(e);
      toast.error('No se pudo enviar el email. Comprueba tu dirección o inténtalo más tarde.', { id: 'email' });
      trackEvent('valuation_email_send_error', { email: watch('email'), reason: e?.message || 'unknown' }, 4, sessionId);
    } finally {
      setSending(false);
    }
  });

  // Abandono (si cierra antes de terminar)
  useEffect(() => {
    return () => {
      if (step !== 4) trackEvent('valuation_calculation_abandon', { step }, step, sessionId);
    };
  }, [step, sessionId]);

  // UI Helpers
  const Label = ({ children, tooltip }: { children: React.ReactNode; tooltip?: string }) => (
    <label className="text-sm flex items-center gap-1">
      {children}
      {tooltip ? (
        <span className="text-xs opacity-70" aria-label={tooltip} title={tooltip}>ⓘ</span>
      ) : null}
    </label>
  );

  return (
    <main className="min-h-screen">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <span className="text-lg font-semibold">Capittal</span>
          <span className="text-sm opacity-70">Calculadora</span>
        </nav>
      </header>

      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Calculadora de Valoración y Fiscalidad</h1>
          <p className="mt-2 opacity-80">Completa los pasos y obtén un informe orientativo al instante.</p>
        </div>

        {/* Navegación pasos */}
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 mb-6" aria-label={`Ir al paso ${step}`}>
          {[1,2,3,4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => goTo(n as 1|2|3|4)}
              className={`h-8 px-3 rounded-md border ${step===n? 'bg-primary text-primary-foreground' : ''}`}
              aria-label={`Ir al paso ${n}`}
            >{n}</button>
          ))}
        </div>

        <form className="max-w-4xl mx-auto bg-background/60 backdrop-blur rounded-xl border p-6 space-y-6" onSubmit={(e)=>e.preventDefault()}>
          {/* Paso 1 */}
          {step===1 && (
            <section>
              <h2 className="text-xl font-medium mb-4">Datos básicos de tu empresa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre y apellidos</Label>
                  <input {...register('full_name')} placeholder="Tu nombre completo" className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.full_name}/>
                  {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name.message}</p>}
                </div>
                <div>
                  <Label>Empresa</Label>
                  <input {...register('company')} placeholder="Nombre legal o comercial" className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.company}/>
                  {errors.company && <p className="text-sm text-red-600 mt-1">{errors.company.message}</p>}
                </div>
                <div>
                  <Label tooltip="Usaremos este dato solo para identificar la compañía">CIF/NIF</Label>
                  <input {...register('cif')} placeholder="Ej. B12345678" className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.cif}/>
                  {errors.cif && <p className="text-sm text-red-600 mt-1">{errors.cif.message}</p>}
                </div>
                <div>
                  <Label tooltip="Solo para enviarte el informe PDF. No hacemos spam.">Email</Label>
                  <input type="email" {...register('email')} placeholder="tu@email.com" className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.email}/>
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label tooltip="Para contacto directo si lo prefieres">Teléfono (opcional)</Label>
                  <input {...register('phone')} placeholder="+34 600 000 000" className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <Label>Sector</Label>
                  <select {...register('sector')} className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.sector}>
                    <option value="">Selecciona tu sector</option>
                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.sector && <p className="text-sm text-red-600 mt-1">{errors.sector.message}</p>}
                </div>
                <div>
                  <Label tooltip="Número entero">Años en activo</Label>
                  <input {...register('years_active')} placeholder="Ej. 7" className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.years_active}/>
                  {errors.years_active && <p className="text-sm text-red-600 mt-1">{errors.years_active.message}</p>}
                </div>
                <div>
                  <Label>Rango de empleados</Label>
                  <select {...register('employees')} className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.employees}>
                    <option value="">Selecciona el rango</option>
                    {employeeRanges.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.employees && <p className="text-sm text-red-600 mt-1">{errors.employees.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label>Ubicación</Label>
                  <input {...register('location')} placeholder="Ciudad o provincia" className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.location}/>
                  {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>}
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" className="rounded-md px-4 py-2 border" onClick={()=>goTo(1)}>Anterior</button>
                <button type="button" className="rounded-md px-4 py-2 border bg-primary text-primary-foreground" onClick={()=>goTo(2)}>Siguiente</button>
              </div>
            </section>
          )}

          {/* Paso 2 */}
          {step===2 && (
            <section>
              <h2 className="text-xl font-medium mb-4">Datos financieros</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label tooltip="Importe anual antes de impuestos">Ingresos anuales (Revenue)</Label>
                  <input {...register('revenue')} placeholder="€ (sin separadores)" className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.revenue}/>
                  {errors.revenue && <p className="text-sm text-red-600 mt-1">{errors.revenue.message}</p>}
                </div>
                <div>
                  <Label tooltip="Beneficio antes de intereses, impuestos, depreciaciones y amortizaciones">EBITDA anual</Label>
                  <input {...register('ebitda')} placeholder="€ (sin separadores)" className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.ebitda}/>
                  {errors.ebitda && <p className="text-sm text-red-600 mt-1">{errors.ebitda.message}</p>}
                </div>
                <div>
                  <Label tooltip="Porcentaje de beneficio sobre ventas tras todos los gastos e impuestos.">Margen neto (%)</Label>
                  <input {...register('net_margin')} placeholder="Ej. 12" className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.net_margin}/>
                  {errors.net_margin && <p className="text-sm text-red-600 mt-1">{errors.net_margin.message}</p>}
                </div>
                <div>
                  <Label tooltip="Estimación para el próximo año">Crecimiento anual (%)</Label>
                  <input {...register('growth')} placeholder="Ej. 8" className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.growth}/>
                  {errors.growth && <p className="text-sm text-red-600 mt-1">{errors.growth.message}</p>}
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" className="rounded-md px-4 py-2 border" onClick={()=>goTo(1)}>Anterior</button>
                <button type="button" className="rounded-md px-4 py-2 border bg-primary text-primary-foreground" onClick={()=>goTo(3)}>Siguiente</button>
              </div>
            </section>
          )}

          {/* Paso 3 */}
          {step===3 && (
            <section>
              <h2 className="text-xl font-medium mb-4">Características del negocio</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label tooltip="Porcentaje aproximado del capital en venta">Participación accionarial</Label>
                  <input {...register('participation')} placeholder="Ej. 100%" className="mt-1 w-full rounded-md border px-3 py-2" aria-invalid={!!errors.participation}/>
                  {errors.participation && <p className="text-sm text-red-600 mt-1">{errors.participation.message}</p>}
                </div>
                <div>
                  <Label tooltip="Describe brevemente (marca, patentes, tecnología, red comercial…)">Ventaja competitiva</Label>
                  <textarea {...register('advantage')} placeholder="Describe brevemente (marca, patentes, tecnología, red comercial…)" className="mt-1 w-full rounded-md border px-3 py-2" rows={4} aria-invalid={!!errors.advantage}/>
                  {errors.advantage && <p className="text-sm text-red-600 mt-1">{errors.advantage.message}</p>}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('consent')} />
                  <span>Acepto recibir comunicaciones relacionadas con mi consulta y la descarga del informe.</span>
                </label>
                {errors.consent && <p className="text-sm text-red-600">{errors.consent.message as any}</p>}
                <p className="text-xs opacity-70">Privacidad: Tratamos tus datos con confidencialidad. Puedes solicitar su eliminación en cualquier momento.</p>
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" className="rounded-md px-4 py-2 border" onClick={()=>goTo(2)}>Anterior</button>
                <button aria-label="Calcular valoración con los datos introducidos" type="button" className="rounded-md px-4 py-2 border bg-primary text-primary-foreground" onClick={onCalculate} disabled={calculating}>
                  {calculating ? 'Calculando…' : 'Calcular valoración'}
                </button>
              </div>
            </section>
          )}

          {/* Paso 4 */}
          {step===4 && result && (
            <section>
              <h2 className="text-2xl font-semibold">Valoración estimada de tu empresa</h2>
              <p className="opacity-80 mt-1">Rango orientativo: €{Math.round(result.min).toLocaleString('es-ES')} – €{Math.round(result.max).toLocaleString('es-ES')}</p>

              <div className="grid gap-4 mt-6 md:grid-cols-3">
                <div className="rounded-lg border p-4"><p className="text-sm opacity-70">Múltiplo EBITDA aplicado</p><p className="text-xl font-semibold">{result.multiple.toFixed(1)}x</p></div>
                <div className="rounded-lg border p-4 md:col-span-2"><p className="text-sm opacity-70">Valoración final estimada</p><p className="text-2xl font-semibold">€{Math.round(result.final).toLocaleString('es-ES')}</p></div>
              </div>

              <p className="text-xs opacity-70 mt-4">Estimación orientativa no vinculante. Sujeta a verificación y análisis detallado.</p>

              <div className="flex flex-wrap gap-2 mt-6">
                <button type="button" onClick={handleDownloadPdf} disabled={pdfGenerating} className="rounded-md px-4 py-2 border">
                  {pdfGenerating ? 'Generando…' : 'Descargar PDF'}
                </button>
                <button type="button" onClick={handleSendEmail} disabled={sending} className="rounded-md px-4 py-2 border">
                  {sending ? 'Enviando…' : 'Enviar informe por email'}
                </button>
                <button type="button" onClick={()=>setStep(3)} className="rounded-md px-4 py-2 border">Recalcular</button>
                <button type="button" onClick={()=>setStep(1)} className="rounded-md px-4 py-2 border">Volver a empezar</button>
              </div>

              {/* Bloque educativo */}
              <div className="grid gap-3 mt-8 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="font-medium">EBITDA</p>
                  <p className="text-sm opacity-80">Indicador operativo que mide la capacidad de generar caja del negocio antes de gastos financieros e impuestos.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="font-medium">Margen neto</p>
                  <p className="text-sm opacity-80">Porcentaje de beneficio sobre ventas tras todos los gastos e impuestos.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="font-medium">Múltiplo EBITDA</p>
                  <p className="text-sm opacity-80">Factor de mercado aplicado al EBITDA para estimar el valor de la empresa.</p>
                </div>
              </div>

              {/* Textos largos */}
              <div className="grid gap-4 mt-8">
                <div className="rounded-lg border p-4"><p className="font-medium">Tu valoración estimada</p><p className="text-sm opacity-80">En base a tus datos y a múltiplos de mercado del sector, estimamos un valor orientativo para tu empresa.</p></div>
                <div className="rounded-lg border p-4"><p className="font-medium">Recomendación</p><p className="text-sm opacity-80">Te recomendamos una revisión más profunda para afinar el rango y maximizar el retorno en una potencial transacción.</p></div>
                <div className="rounded-lg border p-4"><p className="font-medium">¿Qué hacer ahora?</p><p className="text-sm opacity-80">Descarga el informe en PDF o recíbelo en tu email. Es gratuito y confidencial.</p></div>
              </div>
            </section>
          )}

          {/* Pie de confianza */}
          <div className="pt-4">
            <p className="text-xs opacity-70">Capittal — Carrer Ausiàs March, 36, Principal — P.º de la Castellana, 11, B-A, 28046 Madrid.</p>
          </div>
        </form>
      </section>
    </main>
  );
}
