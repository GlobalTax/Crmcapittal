import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    )

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ valid: false, errors: ['No autorizado'] }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ valid: false, errors: ['Usuario no válido'] }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SECURITY FIX: Enhanced input validation and sanitization
    const requestBody = await req.json()
    
    // Validate required fields
    if (!requestBody.action || typeof requestBody.action !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, errors: ['Acción requerida y debe ser texto'] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Sanitize action field
    const action = requestBody.action.toLowerCase().replace(/[^a-z_]/g, '')
    const valoracionId = requestBody.valoracionId
    let data = requestBody.data || {}
    
    // Sanitize data fields if present
    if (data.company_name) {
      data.company_name = await supabase.rpc('sanitize_input', { p_input: data.company_name }).then(r => r.data || '')
    }
    if (data.client_name) {
      data.client_name = await supabase.rpc('sanitize_input', { p_input: data.client_name }).then(r => r.data || '')
    }
    
    console.log(`Validating ${action} for user ${user.id}`)

    // SECURITY FIX: Implement enhanced rate limiting
    const rateLimitId = `valoracion_security_${user.id}_${req.headers.get('x-forwarded-for') || 'unknown'}`
    const rateLimitCheck = await supabase.rpc('check_rate_limit', {
      p_identifier: rateLimitId,
      p_max_requests: 20, // Reduced from 50
      p_window_minutes: 10 // Reduced from 15
    })

    if (!rateLimitCheck.data) {
      // Log the rate limit violation
      await supabase.rpc('log_security_event', {
        p_event_type: 'rate_limit_exceeded',
        p_severity: 'medium',
        p_description: 'Rate limit exceeded for valoracion security validation',
        p_metadata: {
          user_id: user.id,
          ip_address: req.headers.get('x-forwarded-for'),
          user_agent: req.headers.get('user-agent')
        }
      })
      
      return new Response(
        JSON.stringify({ valid: false, errors: ['Demasiadas solicitudes. Espera antes de intentar de nuevo.'] }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SECURITY FIX: Log all validation attempts
    await supabase.rpc('log_security_event', {
      p_event_type: 'valoracion_security_validation',
      p_severity: 'low',
      p_description: `Validation attempt for ${action}`,
      p_metadata: {
        action,
        valoracion_id: valoracionId,
        user_id: user.id,
        request_data: data
      }
    })

    let validationResult = { valid: true, errors: [] }

    switch (action) {
      case 'create':
        // Basic validation for creation
        if (!data.company_name || !data.client_name) {
          validationResult = { valid: false, errors: ['Nombre de empresa y cliente son obligatorios'] }
        }
        break

      case 'update':
      case 'association_change':
        // Allow updates for now
        break

      case 'delete':
        // Only allow admins to delete (simplified check)
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'superadmin'])

        if (!userRoles || userRoles.length === 0) {
          validationResult = { valid: false, errors: ['Solo administradores pueden eliminar valoraciones'] }
        }
        break

      default:
        validationResult = { valid: false, errors: ['Acción no válida'] }
    }

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in validation function:', error)
    return new Response(
      JSON.stringify({ valid: false, errors: ['Error interno del servidor'] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})