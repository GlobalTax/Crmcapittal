// Simple route prefetcher for dynamic imports
// Note: Keep import paths in sync with AppRoutes lazy() calls to reuse chunks
export function prefetchRoute(path: string) {
  try {
    if (path.startsWith('/empresas')) {
      import('@/components/empresas/CompanyList');
      import('@/components/empresas/CompanyDetail');
    } else if (path.startsWith('/contactos')) {
      import('@/components/contactos/ContactList');
      import('@/components/contactos/ContactDetail');
    } else if (path === '/' || path.startsWith('/leads') || path.startsWith('/gestion-leads') || path.startsWith('/captacion')) {
      import('@/components/captacion/LeadsEntryPanel');
      import('@/pages/LeadPage');
    } else if (path.startsWith('/transacciones')) {
      import('@/pages/OptimizedTransaccionesPage');
      import('@/components/transacciones/VentaMandatoView');
    } else if (path.startsWith('/mandatos')) {
      import('@/pages/OptimizedMandatesPage');
    } else if (path.startsWith('/hubspot-data')) {
      import('@/components/hubspot/HubSpotDatabase');
    } else if (path.startsWith('/calendar')) {
      import('@/pages/Calendar');
    }
  } catch (e) {
    console.warn('Prefetch error', e);
  }
}

export function prefetchIdle() {
  const run = () => {
    prefetchRoute('/leads');
    prefetchRoute('/empresas');
    prefetchRoute('/contactos');
  };
  if ('requestIdleCallback' in window) {
    // @ts-ignore
    window.requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 1200);
  }
}
