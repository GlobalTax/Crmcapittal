// Service Layer Exports
export { BaseService } from './base/BaseService';
export type { ServiceResponse, PaginationParams, FilterParams } from './base/BaseService';

// User Services
export { UserService } from './users/UserService';
export type { User, CreateUserData, UpdateUserData } from './users/UserService';

// Company Services
export { CompanyService } from './companies/CompanyService';
export type { 
  Company, 
  CreateCompanyData, 
  CompanyActivity, 
  CompanyNote, 
  CompanyFile 
} from './companies/CompanyService';

// Operation Services
export { OperationService } from './operations/OperationService';
export type { 
  CreateOperationData, 
  OperationFilters 
} from './operations/OperationService';

// Contact Services
export { ContactService } from './contacts/ContactService';
export type { 
  DbContact,
  CreateContactData, 
  ContactActivity, 
  ContactNote, 
  ContactInteraction, 
  ContactFilters 
} from './contacts/ContactService';