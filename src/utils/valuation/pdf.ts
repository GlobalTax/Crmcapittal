import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Lead } from '@/types/Lead';

interface MultipleRow { comparable: string; metric: string; value: string }

export function buildSectorMultiples(sectorName?: string): MultipleRow[] {
  const base: Record<string, { evEbitda: [number, number]; evSales: [number, number] }> = {
    'Tecnología': { evEbitda: [8, 12], evSales: [1.5, 3.0] },
    'Industria': { evEbitda: [6, 9], evSales: [0.8, 1.8] },
    'Servicios': { evEbitda: [7, 11], evSales: [1.0, 2.5] },
    'default': { evEbitda: [6, 10], evSales: [0.9, 2.0] },
  };
  const m = base[sectorName || ''] || base.default;
  return [
    { comparable: sectorName || 'Sector', metric: 'EV/EBITDA', value: `${m.evEbitda[0]}x - ${m.evEbitda[1]}x` },
    { comparable: sectorName || 'Sector', metric: 'EV/VENTAS', value: `${m.evSales[0]}x - ${m.evSales[1]}x` },
  ];
}

export async function generateValuationLightPDF(lead: Lead, opts?: { ebitdaLTM?: number; revenueLTM?: number }) {
  const doc = new jsPDF();

  const title = 'Valoración Inicial (Light)';
  doc.setFontSize(18);
  doc.text(title, 14, 18);

  doc.setFontSize(11);
  doc.text(`Lead: ${lead.name || ''}`, 14, 28);
  if (lead.company_name) doc.text(`Empresa: ${lead.company_name}`, 14, 35);
  if (lead.email) doc.text(`Email: ${lead.email}`, 14, 42);

  const multiples = buildSectorMultiples(lead.sector?.nombre);
  autoTable(doc, {
    startY: 50,
    head: [['Comparable', 'Métrica', 'Rango']],
    body: multiples.map((r) => [r.comparable, r.metric, r.value]),
    styles: { fontSize: 10 },
    theme: 'striped',
  });

  const endY = (doc as any).lastAutoTable?.finalY || 50;
  doc.setFontSize(12);
  doc.text('Rango EV simple (estimación orientativa):', 14, endY + 10);
  const ebitda = opts?.ebitdaLTM || 1000000; // placeholder
  const [mLow, mHigh] = [multiples[0].value, multiples[0].value];
  doc.setFontSize(11);
  doc.text(`EBITDA LTM (aprox.): €${Intl.NumberFormat('es-ES').format(ebitda)}`, 14, endY + 18);
  doc.text(`EV estimado (sector): ${multiples[0].value} sobre EBITDA`, 14, endY + 26);

  const disclaimerY = endY + 40;
  doc.setFontSize(9);
  const disclaimers = [
    'Este documento es una valoración preliminar, orientativa y no vinculante.',
    'Los múltiplos de mercado y cifras utilizadas son de referencia y pueden variar.',
    'No constituye recomendación de inversión ni asesoramiento financiero.'
  ];
  disclaimers.forEach((d, i) => doc.text(`• ${d}`, 14, disclaimerY + i * 6));

  const fileName = `valuation_light_${(lead.company_name || lead.name || 'lead').replace(/\s+/g, '_')}.pdf`;
  const blob = doc.output('blob');
  return { blob, fileName };
}
