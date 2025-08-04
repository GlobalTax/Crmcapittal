# Operations Feature

## 📁 Estructura

```
src/features/operations/
├── types/
│   ├── Operation.ts          # Tipo principal Operation
│   ├── OperationData.ts      # CreateOperationData, UpdateOperationData
│   ├── OperationFilters.ts   # Filtros y estados de filtrado
│   └── index.ts             # Barrel exports
├── services/
│   ├── OperationService.ts   # Clase servicio con BaseService
│   ├── operationsService.ts  # Funciones de servicio
│   └── index.ts             # Barrel exports
├── stores/
│   ├── operationsStore.ts    # Store Zustand unificado
│   └── index.ts             # Barrel exports
├── hooks/                    # TODO: Migrar hooks existentes
├── components/               # TODO: Migrar componentes
├── index.ts                 # Feature barrel export
└── README.md               # Esta documentación
```

## 🎯 Responsabilidades

### Types
- **Operation**: Interfaz principal de operación M&A
- **OperationData**: DTOs para crear/actualizar operaciones
- **OperationFilters**: Tipos para filtrado y búsqueda

### Services
- **OperationService**: Servicio principal extendiendo BaseService
- **operationsService**: Funciones de bajo nivel para DB

### Stores
- **operationsStore**: Store Zustand que reemplaza el Context anterior
  - Manejo de estado unificado
  - Filtrado y paginación
  - Selección múltiple
  - Estados de carga y error

## 🔄 Migración Status

### ✅ Completado:
- Types migrados desde `src/types/Operation.ts`
- Services consolidados
- Store Zustand creado

### 🔄 En Progreso:
- Hooks migration desde `src/hooks/operations/`
- Components migration desde `src/components/`

### ⏳ Pendiente:
- Context elimination
- Import updates en toda la app

## 📋 Uso

```typescript
// Import desde feature
import { Operation, OperationService, useOperationsStore } from '@/features/operations';

// Store usage
const { operations, loading, setFilters } = useOperationsStore();

// Service usage
const result = await OperationService.getOperations(role, filters);
```

## 🏗️ Arquitectura

Este feature sigue el patrón feature-first donde:
- Todo lo relacionado con operaciones está en un lugar
- Separación clara de responsabilidades
- Fácil testing y mantenimiento
- Escalabilidad para futuras features