/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase (requeridas)
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  
  // APIs Externas (opcionales)
  readonly VITE_CAPITAL_MARKET_API_KEY?: string
  readonly VITE_WEBHOOK_SECRET_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
