import { 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  File, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { DocumentReviewStatus } from '@/types/Valoracion';

export const getDocumentIcon = (contentType: string) => {
  if (contentType.includes('pdf')) return FileText;
  if (contentType.includes('image')) return FileImage;
  if (contentType.includes('word')) return FileText;
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) return FileSpreadsheet;
  return File;
};

export const getReviewStatusIcon = (status: DocumentReviewStatus) => {
  switch (status) {
    case 'approved':
      return CheckCircle;
    case 'rejected':
      return XCircle;
    case 'under_review':
      return AlertCircle;
    case 'pending':
    default:
      return Clock;
  }
};

export const getReviewStatusColor = (status: DocumentReviewStatus) => {
  switch (status) {
    case 'approved':
      return 'text-green-600';
    case 'rejected':
      return 'text-red-600';
    case 'under_review':
      return 'text-yellow-600';
    case 'pending':
    default:
      return 'text-gray-500';
  }
};

export const getReviewStatusBadgeVariant = (status: DocumentReviewStatus) => {
  switch (status) {
    case 'approved':
      return 'default' as const;
    case 'rejected':
      return 'destructive' as const;
    case 'under_review':
      return 'secondary' as const;
    case 'pending':
    default:
      return 'outline' as const;
  }
};

export const getReviewStatusLabel = (status: DocumentReviewStatus) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    under_review: 'En Revisión'
  };
  return labels[status];
};