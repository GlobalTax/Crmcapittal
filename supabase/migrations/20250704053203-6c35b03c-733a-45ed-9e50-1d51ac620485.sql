-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  template_id UUID,
  document_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  variables JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- Create document templates table
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  template_type TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Users can view all documents" 
ON public.documents 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create policies for document templates
CREATE POLICY "Users can view all document templates" 
ON public.document_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create document templates" 
ON public.document_templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own document templates" 
ON public.document_templates 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own document templates" 
ON public.document_templates 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create triggers for updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
BEFORE UPDATE ON public.document_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default templates
INSERT INTO public.document_templates (name, description, content, template_type, variables, created_by) VALUES
('Contrato de Compraventa', 'Plantilla estándar para contratos de compraventa de empresas', 
 '{"content": "<h1>CONTRATO DE COMPRAVENTA</h1><p>Entre {{vendedor}} y {{comprador}}, se acuerda la venta de {{empresa}} por un importe de {{precio}}.</p><h2>Condiciones</h2><p>{{condiciones}}</p>"}',
 'contrato', 
 '{"vendedor": "Nombre del vendedor", "comprador": "Nombre del comprador", "empresa": "Nombre de la empresa", "precio": "Precio de venta", "condiciones": "Condiciones específicas"}',
 NULL),
('Memorando de Entendimiento', 'Plantilla para MOU entre partes', 
 '{"content": "<h1>MEMORANDO DE ENTENDIMIENTO</h1><p>Las partes {{parte1}} y {{parte2}} manifiestan su intención de {{objetivo}}.</p><h2>Términos</h2><p>{{terminos}}</p>"}',
 'memorando', 
 '{"parte1": "Primera parte", "parte2": "Segunda parte", "objetivo": "Objetivo del acuerdo", "terminos": "Términos y condiciones"}',
 NULL),
('Informe de Valoración', 'Plantilla para informes de valoración de empresas', 
 '{"content": "<h1>INFORME DE VALORACIÓN</h1><p>Empresa: {{empresa}}</p><p>Valor estimado: {{valor}}</p><h2>Metodología</h2><p>{{metodologia}}</p><h2>Conclusiones</h2><p>{{conclusiones}}</p>"}',
 'informe', 
 '{"empresa": "Nombre de la empresa", "valor": "Valor estimado", "metodologia": "Metodología utilizada", "conclusiones": "Conclusiones del informe"}',
 NULL);