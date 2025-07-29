-- Create cron job for automated notifications (runs every hour)
SELECT cron.schedule(
  'automated-notifications-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://nbvvdaprcecaqvvkqcto.supabase.co/functions/v1/automated-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idnZkYXByY2VjYXF2dmtxY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTQxMDEsImV4cCI6MjA2NTI5MDEwMX0.U-xmTVjSKNxSjCugemIdIqSLDuFEMt8BuvH0IifJAfo"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);