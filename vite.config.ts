import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
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
