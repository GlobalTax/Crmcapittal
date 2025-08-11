import React, { useEffect } from 'react';

const setSeo = () => {
  document.title = 'Gracias por tu solicitud | Capittal';
  const desc = 'Hemos recibido tu solicitud de valoración. Un asesor se pondrá en contacto contigo.';
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', desc); else { const m = document.createElement('meta'); m.name = 'description'; m.content = desc; document.head.appendChild(m); }
  const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  const href = window.location.origin + '/lp/valoraciones/gracias';
  if (canonical) canonical.href = href; else { const l = document.createElement('link'); l.rel = 'canonical'; l.href = href; document.head.appendChild(l); }
};

export default function ValoracionGracias() {
  useEffect(() => { setSeo(); }, []);
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="max-w-xl w-full text-center border rounded-xl p-8 bg-background/60">
        <h1 className="text-3xl font-semibold tracking-tight">¡Gracias! Hemos recibido tu solicitud</h1>
        <p className="mt-2 opacity-80">Te contactaremos en menos de 24-48h para compartir la estimación inicial y próximos pasos.</p>
        <a href="/" className="inline-block mt-6 rounded-md px-4 py-2 border">Volver al inicio</a>
      </section>
    </main>
  );
}
