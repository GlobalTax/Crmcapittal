-- Crear CRON job para ejecutar winback daily scheduler diariamente a las 9:00 AM
SELECT cron.schedule(
  'winback-daily-scheduler',
  '0 9 * * *', -- Diariamente a las 9:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://nbvvdaprcecaqvvkqcto.supabase.co/functions/v1/winback-daily-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idnZkYXByY2VjYXF2dmtxY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTQxMDEsImV4cCI6MjA2NTI5MDEwMX0.U-xmTVjSKNxSjCugemIdIqSLDuFEMt8BuvH0IifJAfo"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);