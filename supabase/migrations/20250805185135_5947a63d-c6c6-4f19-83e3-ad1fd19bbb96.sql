-- Fix security view with correct column name
CREATE OR REPLACE VIEW security_events_summary AS
SELECT 
  date_trunc('hour', created_at) as hour,
  event_type,
  severity,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM security_logs
WHERE created_at > NOW() - interval '24 hours'
GROUP BY date_trunc('hour', created_at), event_type, severity
ORDER BY hour DESC, event_count DESC;

-- Grant appropriate permissions
GRANT SELECT ON security_events_summary TO authenticated;