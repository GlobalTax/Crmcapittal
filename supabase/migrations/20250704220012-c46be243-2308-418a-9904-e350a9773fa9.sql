-- Create test companies
INSERT INTO companies (name, company_type, company_status, lifecycle_stage, company_size, industry, website, created_by) VALUES
('Acme Corporation', 'cliente', 'activa', 'customer', '51-200', 'Technology', 'https://acme.com', '22873c0f-61da-4cd9-94d9-bcde55bc7ca8'),
('TechStart Inc', 'prospect', 'prospecto', 'lead', '11-50', 'Software', 'https://techstart.com', '22873c0f-61da-4cd9-94d9-bcde55bc7ca8'),
('Global Industries', 'cliente', 'activa', 'customer', '201-500', 'Manufacturing', 'https://global-ind.com', '22873c0f-61da-4cd9-94d9-bcde55bc7ca8');

-- Update the existing deal to link to a company and contact
UPDATE deals 
SET company_name = 'Acme Corporation',
    contact_id = (SELECT id FROM contacts LIMIT 1),
    stage_id = (SELECT id FROM stages WHERE name LIKE '%Nuevo%' OR name LIKE '%New%' LIMIT 1)
WHERE id = '677d15cf-79a2-4fbc-8e96-b776ba51fcf0';