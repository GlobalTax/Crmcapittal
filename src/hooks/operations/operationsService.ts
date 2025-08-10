// Shim de compatibilidad: delega en el nuevo OperationService centralizado
import { OperationService } from '@/features/operations/services/OperationService';
export { OperationService } from '@/features/operations/services/OperationService';

// Funciones legacy mapeadas al nuevo servicio
export const fetchOperationsFromDB = (role?: string) => OperationService.fetchOperations(role);
export const insertOperation = (data: any, userId: string) => OperationService.insertOperation(data, userId);
export const insertBulkOperations = (data: any[], userId: string) => OperationService.insertBulkOperations(data as any, userId);
export const updateOperationInDB = (id: string, patch: any) => OperationService.updateOperation(id, patch);
export const updateOperationStatusInDB = (id: string, status: any) => OperationService.updateOperationStatus(id, status);
export const deleteOperationFromDB = (id: string, role?: string) => OperationService.deleteOperation(id, role);
export const updateTeaserUrlInDB = (id: string, url: string | null) => OperationService.updateTeaserUrl(id, url as any);
