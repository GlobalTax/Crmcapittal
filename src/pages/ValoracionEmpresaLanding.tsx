import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const schema = z.object({
  full_name: z.string().min(2, 'Nombre requerido'),
  company: z.string().min(2, 'Empresa requerida'),
  email: z.string().email('Email no válido'),
  phone: z.string().optional(),
  cif: z.string().optional(),
  sector: z.string().min(2, 'Selecciona sector'),
  employees: z.string().min(1, 'Selecciona empleados'),
  description: z.string().min(5, 'Añade una breve descripción'),
});

type FormValues = z.infer<typeof schema>;

const sectors = [
  'Tecnología',
  'Industrial',
  'Alimentación y bebidas',
  'Energía y renovables',
  'Logística y transporte',
  'E‑commerce y retail',
  'Construcción e inmobiliario',
  'Educación y formación',
];

const employeeRanges = ['1-10', '11-50', '51-200', '201-500', '500+'];

const setSeo = () => {
  document.title = 'Valoración de Empresa | Calculadora M&A (Capittal)';
  const desc = 'Calculadora de valoración empresarial para pymes y mid‑market. Resultado inicial y contacto con el equipo M&A.';
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', desc); else {
    const m = document.createElement('meta'); m.name = 'description'; m.content = desc; document.head.appendChild(m);
  }
  const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  const href = window.location.origin + '/valoracion-empresa';
  if (canonical) canonical.href = href; else { const l = document.createElement('link'); l.rel = 'canonical'; l.href = href; document.head.appendChild(l); }
  // JSON-LD Organization + WebPage
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.text = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WebPage',
    name: 'Valoración de Empresa', url: href,
    description: desc,
    publisher: { '@type': 'Organization', name: 'Capittal' }
  });
  document.head.appendChild(ld);
};

export default function ValoracionEmpresaLanding() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => { setSeo(); }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const { data, error } = await supabase.functions.invoke('ingest-lead', {
        body: {
          type: 'valuation_request',
          data: {
            full_name: values.full_name,
            email: values.email,
            phone: values.phone,
            company: values.company,
            cif: values.cif,
            sector: values.sector,
            employee_range: values.employees,
            description: values.description,
            source: 'valuation_landing',
          },
        },
      });
      if (error) throw error;
      toast.success('Solicitud enviada correctamente');
      navigate('/valoracion-gracias');
    } catch (e: any) {
      console.error('Error enviando valoración', e);
      toast.error('No se pudo enviar. Intenta más tarde.');
    }
  };

  return (
    <main className="min-h-screen">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <span className="text-lg font-semibold">Capittal</span>
          <span className="text-sm opacity-70">Calculadora</span>
        </nav>
      </header>

      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Calculadora de Valoración Empresarial</h1>
          <p className="mt-2 opacity-80">Obtén una estimación inicial de tu empresa en pocos pasos.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto bg-background/60 backdrop-blur rounded-xl border p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Nombre de contacto *</label>
              <input {...register('full_name')} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Su nombre completo" />
              {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="text-sm">Nombre de la empresa *</label>
              <input {...register('company')} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Nombre de su empresa" />
              {errors.company && <p className="text-sm text-red-600 mt-1">{errors.company.message}</p>}
            </div>
            <div>
              <label className="text-sm">Email corporativo *</label>
              <input type="email" {...register('email')} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="empresa@ejemplo.com" />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm">Teléfono</label>
              <input {...register('phone')} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="+34 600 000 000" />
            </div>
            <div>
              <label className="text-sm">CIF/NIF</label>
              <input {...register('cif')} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="B12345678" />
            </div>
            <div>
              <label className="text-sm">Sector de actividad *</label>
              <select {...register('sector')} className="mt-1 w-full rounded-md border px-3 py-2">
                <option value="">Selecciona tu sector</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.sector && <p className="text-sm text-red-600 mt-1">{errors.sector.message}</p>}
            </div>
            <div>
              <label className="text-sm">Número de empleados *</label>
              <select {...register('employees')} className="mt-1 w-full rounded-md border px-3 py-2">
                <option value="">Selecciona el rango</option>
                {employeeRanges.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.employees && <p className="text-sm text-red-600 mt-1">{errors.employees.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Descripción de actividad *</label>
              <textarea {...register('description')} className="mt-1 w-full rounded-md border px-3 py-2" rows={3} placeholder="Ej. Distribución HORECA, consultoría IT, etc." />
              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs opacity-70">Transmisión segura • Cumplimiento RGPD • Acceso restringido</p>
            <button type="submit" disabled={isSubmitting} className="rounded-md px-4 py-2 border bg-primary text-primary-foreground disabled:opacity-60">
              {isSubmitting ? 'Enviando…' : 'Siguiente'}
            </button>
          </div>
        </form>

        <div className="max-w-3xl mx-auto mt-8 grid gap-4">
          <div className="rounded-lg border p-4">
            <p className="font-medium">Confidencialidad y privacidad</p>
            <p className="text-sm opacity-80">Tus datos se tratan conforme al RGPD. Puedes solicitar la eliminación cuando quieras.</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium">¿Qué es Capittal?</p>
            <p className="text-sm opacity-80">Firma boutique de M&A especializada en pymes y mid‑market, con cobertura nacional.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
