
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
import { Mail, Download } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  company: z.string().min(2, "La empresa debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
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
      phone: "",
      message: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  const isInfoRequest = actionType === "info";
  const title = isInfoRequest ? "Solicitar Información" : "Descargar Teaser";
  const description = isInfoRequest 
    ? `Solicitar más información sobre ${operation.company_name}`
    : `Descargar teaser de ${operation.company_name}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {isInfoRequest ? (
              <Mail className="h-5 w-5 text-blue-600" />
            ) : (
              <Download className="h-5 w-5 text-green-600" />
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {description} - {getOperationTypeLabel(operation.operation_type)} en {operation.sector}
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
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de tu empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@email.com" {...field} />
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

            {isInfoRequest && (
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje adicional</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Cuéntanos sobre tu interés en esta operación..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Procesando..." : (isInfoRequest ? "Enviar Solicitud" : "Descargar Teaser")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
