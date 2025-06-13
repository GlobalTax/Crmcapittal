
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Operation } from "@/types/Operation";
import { getOperationTypeLabel } from "@/utils/operationHelpers";
import { Mail, FileText, Shield } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  company: z.string().min(2, "La empresa debe tener al menos 2 caracteres"),
  position: z.string().min(2, "El cargo debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  investment_capacity: z.string().min(1, "La capacidad de inversión es requerida"),
  message: z.string().optional(),
});

interface UserDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation;
  actionType: "info" | "teaser";
  onSubmit: (userData: z.infer<typeof formSchema>) => void;
  isLoading?: boolean;
}

export const UserDataModal = ({ 
  isOpen, 
  onClose, 
  operation, 
  actionType,
  onSubmit,
  isLoading = false
}: UserDataModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      position: "",
      phone: "",
      investment_capacity: "",
      message: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  const isInfoRequest = actionType === "info";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <DialogTitle>Solicitar Información Detallada</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            <div className="space-y-2">
              <p>
                <strong>{operation.company_name}</strong> - {getOperationTypeLabel(operation.operation_type)} en {operation.sector}
              </p>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Información confidencial</p>
                    <p>Esta solicitud incluye datos que requieren la firma de un Acuerdo de Confidencialidad (NDA). Recibirás la información completa incluyendo el nombre de la empresa tras la validación.</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre y apellidos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Director, Socio, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email corporativo *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="nombre@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 600 000 000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa/Fondo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de tu organización" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investment_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidad de inversión *</FormLabel>
                    <FormControl>
                      <Input placeholder="ej: 5-10M EUR" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios adicionales</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional sobre tu interés, experiencia en el sector, etc."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
              <p>Al enviar esta solicitud aceptas que tus datos sean utilizados para evaluar tu perfil como inversor y proceder con el envío de información confidencial sujeta a NDA.</p>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enviando solicitud..." : "Enviar Solicitud"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
