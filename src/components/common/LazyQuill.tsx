import { lazy, Suspense } from 'react';

const Quill = lazy(() => import('react-quill'));

// A tiny wrapper that lazy-loads ReactQuill with a small fallback
// Usage: same props as react-quill
export default function LazyQuill(props: any) {
  return (
    <Suspense fallback={<div className="text-xs text-muted-foreground">Cargando editor…</div>}>
      {/* @ts-ignore - passthrough props */}
      <Quill {...props} />
    </Suspense>
  );
}
