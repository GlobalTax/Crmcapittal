-- Verificar el constraint actual en la tabla pipelines
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.pipelines'::regclass 
AND contype = 'c';

-- Verificar también los tipos enum existentes
SELECT 
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%pipeline%'
ORDER BY t.typname, e.enumsortorder;