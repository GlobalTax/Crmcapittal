
import { useState, useEffect } from "react";
import { Operation } from "@/types/Operation";

interface FormData {
  company_name: string;
  project_name: string;
  cif: string;
  sector: string;
  operation_type: Operation["operation_type"];
  amount: string;
  revenue: string;
  ebitda: string;
  currency: string;
  date: string;
  buyer: string;
  seller: string;
  status: Operation["status"];
  description: string;
  location: string;
  contact_email: string;
  contact_phone: string;
  annual_growth_rate: string;
  manager_id: string;
}

export const useEditOperationForm = (operation: Operation | null) => {
  const [formData, setFormData] = useState<FormData>({
    company_name: "",
    project_name: "",
    cif: "",
    sector: "",
    operation_type: "merger" as Operation["operation_type"],
    amount: "",
    revenue: "",
    ebitda: "",
    currency: "EUR",
    date: "",
    buyer: "",
    seller: "",
    status: "available" as Operation["status"],
    description: "",
    location: "",
    contact_email: "",
    contact_phone: "",
    annual_growth_rate: "",
    manager_id: "",
  });

  useEffect(() => {
    if (operation) {
      setFormData({
        company_name: operation.company_name || "",
        project_name: operation.project_name || "",
        cif: operation.cif || "",
        sector: operation.sector || "",
        operation_type: operation.operation_type,
        amount: operation.amount?.toString() || "",
        revenue: operation.revenue?.toString() || "",
        ebitda: operation.ebitda?.toString() || "",
        currency: operation.currency || "EUR",
        date: operation.date || "",
        buyer: operation.buyer || "",
        seller: operation.seller || "",
        status: operation.status,
        description: operation.description || "",
        location: operation.location || "",
        contact_email: operation.contact_email || "",
        contact_phone: operation.contact_phone || "",
        annual_growth_rate: operation.annual_growth_rate?.toString() || "",
        manager_id: operation.manager_id || "none",
      });
    }
  }, [operation]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getSubmitData = (): Partial<Operation> => {
    return {
      company_name: formData.company_name,
      project_name: formData.project_name || null,
      cif: formData.cif || null,
      sector: formData.sector,
      operation_type: formData.operation_type,
      amount: parseInt(formData.amount),
      revenue: formData.revenue ? parseInt(formData.revenue) : null,
      ebitda: formData.ebitda ? parseInt(formData.ebitda) : null,
      currency: formData.currency,
      date: formData.date,
      buyer: formData.buyer || null,
      seller: formData.seller || null,
      status: formData.status,
      description: formData.description || null,
      location: formData.location || null,
      contact_email: formData.contact_email || null,
      contact_phone: formData.contact_phone || null,
      annual_growth_rate: formData.annual_growth_rate ? parseFloat(formData.annual_growth_rate) : null,
      manager_id: formData.manager_id === "none" ? null : formData.manager_id,
    };
  };

  return {
    formData,
    updateField,
    getSubmitData
  };
};
