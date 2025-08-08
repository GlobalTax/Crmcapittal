import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client'],
    exclude: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', '@dnd-kit/modifiers'],
  },
  ssr: {
    noExternal: ['react', 'react-dom'],
    external: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', '@dnd-kit/modifiers'],
  },
  plugins: [
    react(),
    viteCompression({ algorithm: 'brotliCompress' }),
    viteCompression({ algorithm: 'gzip' }),
    viteImagemin({
      gifsicle: { optimizationLevel: 3 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 78 },
      pngquant: { quality: [0.6, 0.8] },
      svgo: { plugins: [{ name: 'removeViewBox', active: false }] },
      webp: { quality: 75 },
    }),
    mode === 'production' && visualizer({ filename: 'dist/stats.html', template: 'treemap', gzipSize: true, brotliSize: true }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve("./node_modules/react"),
      "react-dom": path.resolve("./node_modules/react-dom")
    },
    dedupe: ['react', 'react-dom'],
  },
  define: {
    __DEV__: mode === 'development',
    __PROD__: mode === 'production',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor';
            if (id.includes('@radix-ui')) return 'ui';
            if (id.includes('@dnd-kit')) return 'dnd';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('@xyflow/react')) return 'graphs';
            if (id.includes('quill') || id.includes('react-quill')) return 'editor';
            if (id.includes('xlsx') || id.includes('exceljs')) return 'excel';
            if (id.includes('jspdf')) return 'pdf';
            if (id.includes('tesseract')) return 'ocr';
            if (id.includes('embla')) return 'carousel';
          }
          // Kanban-specific chunks to isolate @dnd-kit usage
          if (id.includes('/src/components/deals/') && id.includes('Kanban')) return 'deals-kanban';
          if (id.includes('/src/components/leads/') && id.includes('Kanban')) return 'leads-kanban';
          if (id.includes('/src/components/mandates/') && id.includes('Kanban')) return 'mandates-kanban';
          if (id.includes('/src/components/negocios/') && id.includes('Kanban')) return 'negocios-kanban';
          if (id.includes('/src/components/reconversiones/') && id.includes('Kanban')) return 'reconversiones-kanban';
          if (id.includes('/src/components/valoraciones/') && id.includes('Kanban')) return 'valoraciones-kanban';
          if (id.includes('/src/components/proposals/kanban/')) return 'proposals-kanban';
          if (id.includes('/src/components/operaciones/') && id.includes('Kanban')) return 'operaciones-kanban';
          
          // Non-kanban chunks
          if (id.includes('/src/pages/Deals') || id.includes('/src/components/deals/')) return 'deals';
          if (id.includes('/src/pages/Lead') || id.includes('/src/components/captacion/')) return 'leads';
          if (id.includes('/src/pages/Company') || id.includes('/src/components/companies/')) return 'companies';
          if (id.includes('/src/pages/Contact') || id.includes('/src/components/contactos/')) return 'contacts';
          if (id.includes('/src/pages/PersonalDashboard') || id.includes('/src/components/personal/')) return 'personal';
          return undefined;
        },
      },
    },
  },
}));
