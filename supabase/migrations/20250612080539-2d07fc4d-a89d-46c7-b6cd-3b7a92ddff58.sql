
-- Crear tabla para las operaciones de tu cartera
CREATE TABLE public.operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('acquisition', 'merger', 'sale', 'ipo')),
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  date DATE NOT NULL,
  buyer TEXT,
  seller TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_process', 'sold', 'withdrawn')),
  description TEXT,
  location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security para control de acceso
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- Política para que cualquiera pueda VER las operaciones disponibles (página pública)
CREATE POLICY "Cualquiera puede ver operaciones disponibles" 
  ON public.operations 
  FOR SELECT 
  USING (status = 'available');

-- Crear tabla para administradores autorizados
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Solo los administradores pueden gestionar operaciones
CREATE POLICY "Solo admins pueden insertar operaciones" 
  ON public.operations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Solo admins pueden actualizar operaciones" 
  ON public.operations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Solo admins pueden eliminar operaciones" 
  ON public.operations 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Los admins pueden ver todas las operaciones (incluidas las no disponibles)
CREATE POLICY "Admins pueden ver todas las operaciones" 
  ON public.operations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Insertar algunas operaciones de ejemplo
INSERT INTO public.operations (company_name, sector, operation_type, amount, currency, date, status, description, location, contact_email) VALUES
('TechFlow Solutions', 'Tecnología', 'sale', 50000000, 'EUR', '2024-03-15', 'available', 'Empresa de software de gestión empresarial con 150 empleados y crecimiento del 25% anual', 'Madrid, España', 'samuel.lorente@gmail.com'),
('Green Energy Partners', 'Energía Renovable', 'sale', 125000000, 'EUR', '2024-02-28', 'available', 'Líder en energía solar con contratos a largo plazo y pipeline de 500MW', 'Barcelona, España', 'samuel.lorente@gmail.com'),
('HealthTech Innovations', 'Salud', 'sale', 75000000, 'USD', '2024-04-02', 'available', 'Startup de telemedicina con 50k usuarios activos y licencias en 5 países', 'Valencia, España', 'samuel.lorente@gmail.com');
