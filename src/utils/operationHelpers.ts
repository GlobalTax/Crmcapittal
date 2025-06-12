
export const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800";
    case "pending_review":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-blue-100 text-blue-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "in_process":
      return "bg-orange-100 text-orange-800";
    case "sold":
      return "bg-purple-100 text-purple-800";
    case "withdrawn":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "available":
      return "Disponible";
    case "pending_review":
      return "Pendiente Revisión";
    case "approved":
      return "Aprobada";
    case "rejected":
      return "Rechazada";
    case "in_process":
      return "En Proceso";
    case "sold":
      return "Vendida";
    case "withdrawn":
      return "Retirada";
    default:
      return status;
  }
};

export const getOperationTypeLabel = (type: string) => {
  switch (type) {
    case "acquisition":
      return "Adquisición";
    case "merger":
      return "Fusión";
    case "sale":
      return "Venta";
    case "ipo":
      return "OPV";
    default:
      return type;
  }
};

export const formatFinancialValue = (value?: number) => {
  if (!value) return 'N/A';
  return `€${(value / 1000000).toFixed(1)}M`;
};

// Nueva función para determinar si una operación es oficial
export const isOfficialOperation = (status: string) => {
  return ['available', 'in_process', 'sold', 'withdrawn'].includes(status);
};

// Nueva función para determinar si una operación es solicitud de usuario
export const isUserRequest = (status: string) => {
  return ['pending_review', 'approved', 'rejected'].includes(status);
};
