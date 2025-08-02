import { OperationsState, OperationsAction } from './types';

export const initialOperationsState: OperationsState = {
  operations: [],
  filteredOperations: [],
  selectedOperations: new Set(),
  filters: {
    sector: '',
    operationType: '',
    location: '',
    amountRange: [0, 100],
    revenueRange: [0, 100],
    growthRate: 0,
    dateRange: '',
    status: ''
  },
  pagination: {
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0
  },
  loading: false,
  error: null,
  searchTerm: ''
};

export const operationsReducer = (state: OperationsState, action: OperationsAction): OperationsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_OPERATIONS':
      return { 
        ...state, 
        operations: action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_FILTERED_OPERATIONS':
      return { 
        ...state, 
        filteredOperations: action.payload,
        pagination: {
          ...state.pagination,
          totalItems: action.payload.length,
          totalPages: Math.ceil(action.payload.length / state.pagination.pageSize)
        }
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      };
    
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
        pagination: { ...state.pagination, page: 1 }
      };
    
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };
    
    case 'SELECT_OPERATION':
      return {
        ...state,
        selectedOperations: new Set([...state.selectedOperations, action.payload])
      };
    
    case 'DESELECT_OPERATION':
      const newSelection = new Set(state.selectedOperations);
      newSelection.delete(action.payload);
      return {
        ...state,
        selectedOperations: newSelection
      };
    
    case 'SELECT_ALL_OPERATIONS':
      return {
        ...state,
        selectedOperations: new Set(state.filteredOperations.map(op => op.id))
      };
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedOperations: new Set()
      };
    
    case 'ADD_OPERATION':
      return {
        ...state,
        operations: [...state.operations, action.payload]
      };
    
    case 'UPDATE_OPERATION':
      return {
        ...state,
        operations: state.operations.map(op =>
          op.id === action.payload.id ? { ...op, ...action.payload.data } : op
        )
      };
    
    case 'DELETE_OPERATION':
      return {
        ...state,
        operations: state.operations.filter(op => op.id !== action.payload),
        selectedOperations: new Set([...state.selectedOperations].filter(id => id !== action.payload))
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialOperationsState.filters,
        searchTerm: '',
        pagination: { ...state.pagination, page: 1 }
      };
    
    default:
      return state;
  }
};