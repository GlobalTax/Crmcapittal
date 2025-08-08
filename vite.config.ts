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
    },
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
          if (id.includes('/src/pages/Deals') || id.includes('/src/components/deals/')) return 'deals';
          if (id.includes('/src/pages/Lead') || id.includes('/src/components/captacion/')) return 'leads';
          if (id.includes('/src/pages/Company') || id.includes('/src/components/companies/')) return 'companies';
          if (id.includes('/src/pages/Contact') || id.includes('/src/components/contactos/')) return 'contacts';
          return undefined;
        },
      },
    },
  },
}));
