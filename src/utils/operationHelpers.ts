
export const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800";
    case "in_process":
      return "bg-orange-100 text-orange-800";
    case "sold":
      return "bg-blue-100 text-blue-800";
    case "withdrawn":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "available":
      return "Disponible";
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
