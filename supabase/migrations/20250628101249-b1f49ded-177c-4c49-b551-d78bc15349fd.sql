
-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  contact_type TEXT NOT NULL DEFAULT 'other',
  notes TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_notes table for interaction history
CREATE TABLE public.contact_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_operations junction table to link contacts with operations
CREATE TABLE public.contact_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  operation_id UUID NOT NULL REFERENCES public.operations(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'involved',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_id, operation_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_operations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts
CREATE POLICY "Users can view all contacts" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Users can create contacts" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own contacts" ON public.contacts FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own contacts" ON public.contacts FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for contact_notes
CREATE POLICY "Users can view all contact notes" ON public.contact_notes FOR SELECT USING (true);
CREATE POLICY "Users can create contact notes" ON public.contact_notes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own contact notes" ON public.contact_notes FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own contact notes" ON public.contact_notes FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for contact_operations
CREATE POLICY "Users can view all contact operations" ON public.contact_operations FOR SELECT USING (true);
CREATE POLICY "Users can manage contact operations" ON public.contact_operations FOR ALL USING (true);

-- Add updated_at trigger for contacts
CREATE TRIGGER update_contacts_updated_at 
  BEFORE UPDATE ON public.contacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
