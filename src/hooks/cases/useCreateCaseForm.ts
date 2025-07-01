
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCases } from "@/hooks/useCases";
import { CreateCaseData } from "@/types/Case";
import { createCaseFormSchema, CreateCaseFormData } from "@/components/cases/schemas/createCaseSchema";

export const useCreateCaseForm = (onSuccess: () => void, onClose: () => void) => {
  const [loading, setLoading] = useState(false);
  const { createCase } = useCases();

  const form = useForm<CreateCaseFormData>({
    resolver: zodResolver(createCaseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      contact_id: "",
      company_id: "",
      practice_area_id: "",
      priority: "medium",
      start_date: "",
      end_date: "",
    },
  });

  const onSubmit = async (values: CreateCaseFormData) => {
    try {
      setLoading(true);
      
      // Ensure required fields are present
      const caseData: CreateCaseData = {
        title: values.title,
        contact_id: values.contact_id,
        practice_area_id: values.practice_area_id,
        description: values.description || undefined,
        company_id: values.company_id || undefined,
        priority: values.priority || "medium",
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined,
        estimated_hours: values.estimated_hours || undefined,
      };
      
      await createCase(caseData);
      onSuccess();
      onClose();
      form.reset();
    } catch (error) {
      console.error("Error creating case:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
