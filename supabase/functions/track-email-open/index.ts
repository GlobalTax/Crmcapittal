
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

// 1x1 transparent pixel in base64 (PNG)
const TRACKING_PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

serve(async (req: Request) => {
  const url = new URL(req.url);
  const trackingId = url.pathname.split('/').pop();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (trackingId) {
      // Obtener conteo actual y luego incrementarlo
      const { data } = await supabase
        .from('lead_emails')
        .select('id, open_count')
        .eq('tracking_id', trackingId)
        .maybeSingle();

      if (data) {
        await supabase
          .from('lead_emails')
          .update({ open_count: (data.open_count || 0) + 1, last_open_at: new Date().toISOString() })
          .eq('id', data.id);
      }
    }
  } catch (error) {
    console.error('Error in track-email-open:', error);
  }

  // Return the pixel (no-cache)
  return new Response(atob(TRACKING_PIXEL), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
});
