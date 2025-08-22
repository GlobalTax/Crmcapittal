import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  email: string;
  role?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('📧 Send invitation function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.email);

    // Parse request body
    const { email, role = 'user' }: InvitationRequest = await req.json();

    // Enhanced email validation
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate role
    const validRoles = ['user', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      console.error('❌ Invalid role:', role);
      return new Response(
        JSON.stringify({ error: 'Invalid role specified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input sanitization
    const sanitizedEmail = email.trim().toLowerCase();
    
    // Check for suspicious email patterns
    if (sanitizedEmail.includes('+') && sanitizedEmail.split('+').length > 2) {
      console.error('❌ Suspicious email pattern detected:', sanitizedEmail);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📝 Creating invitation for:', email, 'with role:', role);

    // Create invitation using the database function
    const { data: invitationId, error: invitationError } = await supabase
      .rpc('create_user_invitation', {
        p_email: email,
        p_role: role
      });

    if (invitationError) {
      console.error('❌ Error creating invitation:', invitationError);
      return new Response(
        JSON.stringify({ error: invitationError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Invitation created with ID:', invitationId);

    // Get the invitation details including token
    const { data: invitation, error: getError } = await supabase
      .from('pending_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (getError || !invitation) {
      console.error('❌ Error getting invitation:', getError);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve invitation details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Create invitation URL
    const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
    const invitationUrl = `${baseUrl}/invitation/${invitation.token}`;

    console.log('📨 Sending invitation email to:', email);

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: 'CRM Pro <onboarding@resend.dev>',
      to: [email],
      subject: 'Invitación para unirte a CRM Pro - M&A Platform',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px;">
          <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <div style="width: 32px; height: 32px; background-color: #2563eb; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-weight: bold; font-size: 18px;">C</span>
                </div>
                <div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #1e293b;">CRM Pro</h1>
                  <p style="margin: 0; color: #64748b; font-size: 14px;">M&A Platform</p>
                </div>
              </div>
            </div>
            
            <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">¡Has sido invitado a unirte a CRM Pro!</h2>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 24px;">
              Has sido invitado a formar parte de nuestra plataforma CRM especializada en fusiones y adquisiciones. 
              Tu rol asignado será: <strong style="color: #2563eb;">${role}</strong>
            </p>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 32px;">
              Para activar tu cuenta y establecer tu contraseña, simplemente haz clic en el botón de abajo:
            </p>
            
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${invitationUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                Activar mi cuenta
              </a>
            </div>
            
            <div style="background-color: #f1f5f9; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #475569; font-size: 14px;">
                <strong>Importante:</strong> Esta invitación expirará en 7 días. Si no puedes hacer clic en el botón, 
                copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 8px 0 0 0; word-break: break-all; color: #2563eb; font-size: 14px;">
                ${invitationUrl}
              </p>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; color: #64748b; font-size: 14px;">
              <p style="margin: 0;">
                Si no esperabas esta invitación, puedes ignorar este correo de forma segura.
              </p>
              <p style="margin: 8px 0 0 0;">
                Saludos,<br>
                <strong>El equipo de CRM Pro</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('✅ Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitationId,
        message: 'Invitación enviada exitosamente' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in send-invitation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);