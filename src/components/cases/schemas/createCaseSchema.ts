
import * as z from "zod";

export const createCaseFormSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  contact_id: z.string().min(1, "El contacto es requerido"),
  company_id: z.string().optional(),
  practice_area_id: z.string().min(1, "El área de práctica es requerida"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  estimated_hours: z.number().optional(),
});

export type CreateCaseFormData = z.infer<typeof createCaseFormSchema>;
