
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

// 1x1 transparent pixel in base64
const TRACKING_PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

serve(async (req: Request) => {
  const url = new URL(req.url);
  const trackingId = url.pathname.split('/').pop();

  if (!trackingId) {
    return new Response(atob(TRACKING_PIXEL), {
      headers: { 'Content-Type': 'image/png' }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user agent and IP
    const userAgent = req.headers.get('user-agent') || '';
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

    // Update email tracking info
    const { error } = await supabase
      .from('tracked_emails')
      .update({
        status: 'OPENED',
        opened_at: new Date().toISOString(),
        open_count: supabase.sql`open_count + 1`,
        user_agent: userAgent,
        ip_address: ipAddress
      })
      .eq('tracking_id', trackingId);

    if (error) {
      // Log the error for debugging purposes
      console.error('Error updating email tracking:', error);
    } else {
      // Log successful email open
      console.log(`Email opened: ${trackingId}`);
    }

  } catch (error) {
    // Log error for debugging purposes
    console.error('Error in track-email-open:', error);
  }

  // Always return the tracking pixel
  return new Response(atob(TRACKING_PIXEL), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
});
