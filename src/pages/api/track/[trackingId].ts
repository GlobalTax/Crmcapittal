
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { trackingId } = req.query;

  if (!trackingId || typeof trackingId !== 'string') {
    return res.status(400).json({ message: 'Invalid tracking ID' });
  }

  try {
    // Find the tracked email
    const { data: email, error: findError } = await supabase
      .from('tracked_emails')
      .select('*')
      .eq('tracking_id', trackingId)
      .single();

    if (findError || !email) {
      console.error('Email not found:', findError);
    } else {
      // Update the email tracking status
      const { error: updateError } = await supabase
        .from('tracked_emails')
        .update({
          status: 'OPENED',
          opened_at: email.opened_at || new Date().toISOString(),
          open_count: email.open_count + 1,
          user_agent: req.headers['user-agent'] || null,
          ip_address: req.socket?.remoteAddress || req.headers['x-forwarded-for'] || null
        })
        .eq('id', email.id);

      if (updateError) {
        console.error('Error updating email tracking:', updateError);
      }
    }
  } catch (error) {
    console.error('Error in tracking endpoint:', error);
  }

  // Return 1x1 transparent GIF pixel
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Content-Length', pixel.length);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  return res.end(pixel);
}
