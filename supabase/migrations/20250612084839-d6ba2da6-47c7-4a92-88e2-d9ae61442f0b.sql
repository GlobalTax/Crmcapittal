
-- Crear tabla para gestores de operaciones
CREATE TABLE public.operation_managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.operation_managers ENABLE ROW LEVEL SECURITY;

-- Solo los administradores pueden gestionar los gestores
CREATE POLICY "Solo admins pueden ver gestores" 
  ON public.operation_managers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Solo admins pueden insertar gestores" 
  ON public.operation_managers 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Solo admins pueden actualizar gestores" 
  ON public.operation_managers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Solo admins pueden eliminar gestores" 
  ON public.operation_managers 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Agregar referencia al gestor en la tabla operations
ALTER TABLE public.operations 
ADD COLUMN manager_id UUID REFERENCES public.operation_managers(id);

-- Insertar algunos gestores de ejemplo
INSERT INTO public.operation_managers (name, email, phone, position) VALUES
('Samuel Lorente', 'samuel.lorente@gmail.com', '+34 600 123 456', 'Senior M&A Advisor'),
('María García', 'maria.garcia@company.com', '+34 600 789 012', 'Investment Director'),
('Carlos Ruiz', 'carlos.ruiz@company.com', '+34 600 345 678', 'Business Development Manager');
