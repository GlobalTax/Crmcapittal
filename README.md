
# CRMCAPITTAL - Sistema CRM para Capital Market

Sistema CRM completo desarrollado en React + TypeScript para la gestión de operaciones de capital market, leads, contactos y pipelines.

## 🚀 Características

- **Gestión de Operaciones**: Crear, editar y gestionar operaciones de capital market
- **CRM Completo**: Gestión de leads, contactos, empresas y deals
- **Pipelines**: Visualización y gestión de pipelines de ventas
- **Autenticación**: Sistema de autenticación seguro con Supabase
- **Dashboard**: Panel de control con métricas y actividades
- **Importación Masiva**: Carga masiva de datos desde Excel (mejorado con ExcelJS)
- **Tracking de Tiempo**: Sistema de seguimiento de tiempo
- **Automatización**: Workflows automáticos para leads

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Formularios**: React Hook Form + Zod
- **Notificaciones**: Sonner + React Hot Toast
- **Excel Processing**: ExcelJS (reemplazado xlsx por seguridad)

## 🔒 Mejoras de Seguridad

### ✅ Vulnerabilidades Resueltas
- **xlsx → exceljs**: Eliminada vulnerabilidad crítica de Prototype Pollution
- **Mejor manejo de errores**: Error boundaries mejorados con recuperación
- **Validación de datos**: Validación más estricta en importación de Excel

### Beneficios de ExcelJS
- Procesamiento más seguro de archivos Excel
- Mejor rendimiento y menor tamaño de bundle
- API más moderna y mantenible
- Soporte completo para formatos Excel modernos

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd CRMCAPITTAL
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `env.example` a `.env.local`:

```bash
cp env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_CAPITAL_MARKET_API_KEY=your-api-key-here
VITE_WEBHOOK_SECRET_KEY=your-webhook-secret-here
```

### 4. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta las migraciones desde la carpeta `supabase/migrations/`
3. Configura las políticas RLS según tus necesidades

### 5. Ejecutar el proyecto

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Vista previa
npm run preview
```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run build:dev` - Construir en modo desarrollo
- `npm run lint` - Ejecutar ESLint
- `npm run preview` - Vista previa de la build

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI base
│   ├── layout/         # Componentes de layout
│   ├── common/         # Componentes comunes (ErrorBoundary, etc.)
│   ├── deals/          # Componentes de deals
│   ├── contacts/       # Componentes de contactos
│   └── ...
├── hooks/              # Hooks personalizados
├── pages/              # Páginas de la aplicación
├── contexts/           # Contextos de React
├── services/           # Servicios de API
├── types/              # Tipos de TypeScript
├── utils/              # Utilidades
└── integrations/       # Integraciones externas
```

## 🔒 Seguridad

- **Autenticación**: JWT con Supabase Auth
- **Autorización**: Row Level Security (RLS) en PostgreSQL
- **Validación**: Zod para validación de esquemas
- **Sanitización**: Validación de entrada en formularios
- **Manejo de Errores**: Error boundaries con recuperación automática

## 📊 Funcionalidades Principales

### Operaciones
- Crear y gestionar operaciones de capital market
- Importación masiva desde Excel (con ExcelJS seguro)
- Filtros avanzados y búsqueda
- Estados y flujos de trabajo
- Validación robusta de datos

### CRM
- Gestión de leads y contactos
- Pipeline de ventas
- Seguimiento de actividades
- Automatización de workflows

### Dashboard
- Métricas en tiempo real
- Actividad reciente
- Gráficos y reportes
- Notificaciones

## 🚨 Historial de Vulnerabilidades

### ✅ Resueltas (v2.0.0)
- **xlsx (Crítica)**: Prototype Pollution → Reemplazado por ExcelJS
- **Error Handling**: Mejorado manejo de errores con recuperación

### Pendientes (Moderadas)
- @babel/runtime, brace-expansion, esbuild, nanoid

### Solución para pendientes
```bash
npm audit fix
```

## 🔄 Changelog

### v2.0.0 - Mejoras de Seguridad
- ✅ Reemplazado xlsx por exceljs (vulnerabilidad crítica resuelta)
- ✅ Mejorado manejo de errores con Error Boundaries
- ✅ Navegación mejorada en errores
- ✅ Validación más robusta de datos Excel
- ✅ Better error recovery mechanisms

### v1.0.0
- Lanzamiento inicial
- Sistema CRM completo
- Integración con Supabase
- Dashboard y métricas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

## 🔍 Auditoría de Seguridad

Para verificar el estado de seguridad actual:

```bash
# Verificar vulnerabilidades
npm audit

# Corregir automáticamente
npm audit fix

# Ver detalles de una vulnerabilidad específica
npm audit --audit-level=moderate
```
