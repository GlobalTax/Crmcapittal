-- Set up cron jobs for task reminders
SELECT cron.schedule(
  'task-reminders-hourly',
  '0 * * * *', -- Every hour
  $$
  select net.http_post(
    url:='https://nbvvdaprcecaqvvkqcto.supabase.co/functions/v1/task-reminders-cron',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idnZkYXByY2VjYXF2dmtxY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTQxMDEsImV4cCI6MjA2NTI5MDEwMX0.U-xmTVjSKNxSjCugemIdIqSLDuFEMt8BuvH0IifJAfo"}'::jsonb,
    body:='{"type": "hourly_check"}'::jsonb
  ) as request_id;
  $$
);

SELECT cron.schedule(
  'task-reminders-daily',
  '0 9 * * *', -- Daily at 9 AM
  $$
  select net.http_post(
    url:='https://nbvvdaprcecaqvvkqcto.supabase.co/functions/v1/task-reminders-cron',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idnZkYXByY2VjYXF2dmtxY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTQxMDEsImV4cCI6MjA2NTI5MDEwMX0.U-xmTVjSKNxSjCugemIdIqSLDuFEMt8BuvH0IifJAfo"}'::jsonb,
    body:='{"type": "daily_summary"}'::jsonb
  ) as request_id;
  $$
);