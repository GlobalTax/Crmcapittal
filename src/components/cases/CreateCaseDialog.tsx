
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useCreateCaseForm } from "@/hooks/cases/useCreateCaseForm";
import { BasicCaseInfo } from "./forms/BasicCaseInfo";
import { ContactCompanyInfo } from "./forms/ContactCompanyInfo";
import { PracticeAreaPriorityInfo } from "./forms/PracticeAreaPriorityInfo";
import { DatesHoursInfo } from "./forms/DatesHoursInfo";

interface CreateCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCaseCreated: () => void;
}

export const CreateCaseDialog = ({ open, onOpenChange, onCaseCreated }: CreateCaseDialogProps) => {
  const { form, loading, onSubmit } = useCreateCaseForm(
    onCaseCreated,
    () => onOpenChange(false)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Expediente</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo expediente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <BasicCaseInfo form={form} />
              <ContactCompanyInfo form={form} />
              <PracticeAreaPriorityInfo form={form} />
              <DatesHoursInfo form={form} />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Expediente"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
