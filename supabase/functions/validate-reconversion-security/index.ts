
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidationRequest {
  action: 'create' | 'update' | 'delete' | 'assignment_change'
  reconversionId?: string
  data?: {
    company_name?: string
    contact_name?: string
    investment_capacity_min?: number
    investment_capacity_max?: number
    revenue_range_min?: number
    revenue_range_max?: number
    ebitda_range_min?: number
    ebitda_range_max?: number
    buyer_contact_info?: any
    original_rejection_reason?: string
    assigned_to?: string
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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

    // Enhanced authentication check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ valid: false, errors: ['No autorizado'] }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ valid: false, errors: ['Usuario no válido'] }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enhanced input validation and sanitization
    const requestBody = await req.json()
    
    // Validate required fields
    if (!requestBody.action || typeof requestBody.action !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, errors: ['Acción requerida y debe ser texto'] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Sanitize and validate action field
    const allowedActions = ['create', 'update', 'delete', 'assignment_change', 'status_change'];
    const action = requestBody.action.toLowerCase().replace(/[^a-z_]/g, '')
    
    if (!allowedActions.includes(action)) {
      // Log suspicious activity
      await supabase.rpc('enhanced_log_security_event', {
        p_event_type: 'invalid_reconversion_action',
        p_severity: 'medium',
        p_description: `Invalid reconversion action attempted: ${requestBody.action}`,
        p_metadata: {
          user_id: user.id,
          attempted_action: requestBody.action,
          ip_address: req.headers.get('x-forwarded-for'),
          user_agent: req.headers.get('user-agent')
        }
      })
      
      return new Response(
        JSON.stringify({ valid: false, errors: ['Acción no válida'] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const reconversionId = requestBody.reconversionId
    let data = requestBody.data || {}
    
    // Enhanced input sanitization using database function
    if (data.company_name) {
      const { data: sanitized, error: sanitizeError } = await supabase.rpc('sanitize_input', { 
        p_input: data.company_name,
        p_max_length: 200
      });
      if (sanitizeError) {
        console.error('Sanitization error:', sanitizeError);
        data.company_name = '';
      } else {
        data.company_name = sanitized || '';
      }
    }
    
    if (data.contact_name) {
      const { data: sanitized, error: sanitizeError } = await supabase.rpc('sanitize_input', { 
        p_input: data.contact_name,
        p_max_length: 100
      });
      if (sanitizeError) {
        console.error('Sanitization error:', sanitizeError);
        data.contact_name = '';
      } else {
        data.contact_name = sanitized || '';
      }
    }

    // Enhanced rate limiting with user context
    const rateLimitId = `reconversion_security_${user.id}_${req.headers.get('x-forwarded-for') || 'unknown'}`
    const rateLimitCheck = await supabase.rpc('check_rate_limit', {
      p_identifier: rateLimitId,
      p_max_requests: 15, // Reduced for tighter security
      p_window_minutes: 10
    })

    if (!rateLimitCheck.data) {
      // Log the rate limit violation
      await supabase.rpc('enhanced_log_security_event', {
        p_event_type: 'rate_limit_exceeded',
        p_severity: 'high',
        p_description: 'Rate limit exceeded for reconversion security validation',
        p_metadata: {
          user_id: user.id,
          ip_address: req.headers.get('x-forwarded-for'),
          user_agent: req.headers.get('user-agent'),
          action: action,
          reconversion_id: reconversionId
        }
      })
      
      return new Response(
        JSON.stringify({ valid: false, errors: ['Demasiadas solicitudes. Espera antes de intentar de nuevo.'] }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enhanced security logging for all validation attempts
    await supabase.rpc('enhanced_log_security_event', {
      p_event_type: 'reconversion_security_validation',
      p_severity: 'low',
      p_description: `Validation attempt for ${action}`,
      p_metadata: {
        action,
        reconversion_id: reconversionId,
        user_id: user.id,
        request_data: data,
        ip_address: req.headers.get('x-forwarded-for'),
        timestamp: new Date().toISOString()
      }
    })

    // Get user role for authorization checks
    const { data: userRole } = await supabase.rpc('get_user_highest_role', { p_user_id: user.id });

    let validationResult = { valid: true, errors: [] as string[] }

    switch (action) {
      case 'create':
        validationResult = await validateReconversionData(supabase, user.id, data)
        break
      
      case 'update':
        validationResult = await validateReconversionUpdate(supabase, user.id, reconversionId!, data, userRole)
        break
      
      case 'assignment_change':
        validationResult = await validateAssignmentChange(supabase, user.id, reconversionId!, data, userRole)
        break
      
      case 'delete':
        validationResult = await validateDeletion(supabase, user.id, reconversionId!, userRole)
        break

      case 'status_change':
        validationResult = await validateStatusChange(supabase, user.id, reconversionId!, data, userRole)
        break
    }

    // Enhanced security logging for validation results
    if (!validationResult.valid) {
      await supabase.rpc('enhanced_log_security_event', {
        p_event_type: 'reconversion_validation_failed',
        p_severity: 'medium',
        p_description: `Validation failed for ${action}: ${validationResult.errors.join(', ')}`,
        p_metadata: {
          user_id: user.id,
          action,
          reconversion_id: reconversionId,
          errors: validationResult.errors,
          attempted_data: data,
          user_agent: req.headers.get('User-Agent'),
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      })
    }

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in validation function:', error)
    
    // Log critical errors with enhanced security logging
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
      
      await supabase.rpc('enhanced_log_security_event', {
        p_event_type: 'reconversion_validation_error',
        p_severity: 'critical',
        p_description: `Critical error in reconversion validation: ${error.message}`,
        p_metadata: {
          error: error.message,
          stack: error.stack,
          ip_address: req.headers.get('x-forwarded-for'),
          user_agent: req.headers.get('user-agent')
        }
      })
    } catch (logError) {
      console.error('Failed to log critical error:', logError)
    }
    
    return new Response(
      JSON.stringify({ valid: false, errors: ['Error interno del servidor'] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function validateReconversionData(supabaseClient: any, userId: string, data: any) {
  const errors: string[] = []

  // Sanitizar y validar campos de texto
  if (data?.company_name) {
    const sanitized = data.company_name.trim()
    if (sanitized.length === 0) {
      errors.push('El nombre de la empresa es requerido')
    } else if (sanitized.length > 200) {
      errors.push('El nombre de la empresa no puede exceder 200 caracteres')
    }
    // Validar HTML/scripts
    if (/<[^>]*>/g.test(sanitized)) {
      errors.push('El nombre de la empresa no puede contener HTML')
    }
  }

  if (data?.contact_name) {
    const sanitized = data.contact_name.trim()
    if (sanitized.length === 0) {
      errors.push('El nombre del contacto es requerido')
    } else if (sanitized.length > 200) {
      errors.push('El nombre del contacto no puede exceder 200 caracteres')
    }
  }

  // Validar rangos de inversión
  if (data?.investment_capacity_min !== undefined) {
    if (data.investment_capacity_min < 0) {
      errors.push('La capacidad mínima de inversión no puede ser negativa')
    }
    if (data.investment_capacity_min > 100000000) { // 100M límite razonable
      errors.push('La capacidad mínima de inversión excede el límite permitido')
    }
  }

  if (data?.investment_capacity_max !== undefined) {
    if (data.investment_capacity_max < 0) {
      errors.push('La capacidad máxima de inversión no puede ser negativa')
    }
    if (data.investment_capacity_min && data.investment_capacity_max < data.investment_capacity_min) {
      errors.push('La capacidad máxima de inversión no puede ser menor a la mínima')
    }
  }

  // Validar rangos de ingresos
  if (data?.revenue_range_min !== undefined && data.revenue_range_min < 0) {
    errors.push('El rango mínimo de ingresos no puede ser negativo')
  }

  if (data?.revenue_range_max !== undefined && data?.revenue_range_min !== undefined) {
    if (data.revenue_range_max < data.revenue_range_min) {
      errors.push('El rango máximo de ingresos no puede ser menor al mínimo')
    }
  }

  // Validar EBITDA
  if (data?.ebitda_range_min !== undefined && data.ebitda_range_min < 0) {
    errors.push('El EBITDA mínimo no puede ser negativo')
  }

  if (data?.ebitda_range_max !== undefined && data?.ebitda_range_min !== undefined) {
    if (data.ebitda_range_max < data.ebitda_range_min) {
      errors.push('El EBITDA máximo no puede ser menor al mínimo')
    }
  }

  // Validar email en buyer_contact_info
  if (data?.buyer_contact_info?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.buyer_contact_info.email)) {
      errors.push('El email del comprador no es válido')
    }
  }

  // Validar motivo de rechazo
  if (data?.original_rejection_reason) {
    const sanitized = data.original_rejection_reason.trim()
    if (sanitized.length > 1000) {
      errors.push('El motivo de rechazo no puede exceder 1000 caracteres')
    }
    if (/<script[^>]*>.*?<\/script>/gi.test(sanitized)) {
      errors.push('El motivo de rechazo contiene contenido no permitido')
    }
  }

  return { valid: errors.length === 0, errors }
}

async function validateReconversionUpdate(supabase: any, userId: string, reconversionId: string, data: any, userRole: string) {
  const errors: string[] = []

  // Check if reconversion exists and user has permission
  const { data: reconversion } = await supabase
    .from('reconversiones_new')
    .select('created_by, assigned_to, pipeline_owner_id')
    .eq('id', reconversionId)
    .single()

  if (!reconversion) {
    errors.push('Reconversión no encontrada')
    return { valid: false, errors }
  }

  const hasPermission = reconversion.created_by === userId || 
                       reconversion.assigned_to === userId || 
                       reconversion.pipeline_owner_id === userId ||
                       ['admin', 'superadmin'].includes(userRole)

  if (!hasPermission) {
    errors.push('No tienes permisos para modificar esta reconversión')
  }

  // Validate data (reuse validation logic)
  const dataValidation = await validateReconversionData(supabase, userId, data)
  if (!dataValidation.valid) {
    errors.push(...dataValidation.errors)
  }

  return { valid: errors.length === 0, errors }
}

async function validateAssignmentChange(supabase: any, userId: string, reconversionId: string, data: any, userRole: string) {
  const errors: string[] = []

  // Only admins can change assignments
  if (!['admin', 'superadmin'].includes(userRole)) {
    errors.push('Solo administradores pueden cambiar asignaciones')
    return { valid: false, errors }
  }

  // Verify reconversion exists
  const { data: reconversion } = await supabase
    .from('reconversiones_new')
    .select('id')
    .eq('id', reconversionId)
    .single()

  if (!reconversion) {
    errors.push('Reconversión no encontrada')
  }

  // Validate that the assigned user exists if provided
  if (data?.assigned_to) {
    const { data: user } = await supabase.auth.admin.getUserById(data.assigned_to)
    if (!user.user) {
      errors.push('El usuario asignado no existe')
    }
  }

  return { valid: errors.length === 0, errors }
}

async function validateStatusChange(supabase: any, userId: string, reconversionId: string, data: any, userRole: string) {
  const errors: string[] = []

  // Check if reconversion exists and user has permission
  const { data: reconversion } = await supabase
    .from('reconversiones_new')
    .select('created_by, assigned_to, pipeline_owner_id, estado')
    .eq('id', reconversionId)
    .single()

  if (!reconversion) {
    errors.push('Reconversión no encontrada')
    return { valid: false, errors }
  }

  const hasPermission = reconversion.created_by === userId || 
                       reconversion.assigned_to === userId || 
                       reconversion.pipeline_owner_id === userId ||
                       ['admin', 'superadmin'].includes(userRole)

  if (!hasPermission) {
    errors.push('No tienes permisos para cambiar el estado de esta reconversión')
  }

  // Validate status transition (basic validation)
  const allowedStatuses = ['activa', 'matching', 'negociacion', 'cerrada', 'cancelada']
  if (data.new_status && !allowedStatuses.includes(data.new_status)) {
    errors.push('Estado no válido')
  }

  return { valid: errors.length === 0, errors }
}

async function validateDeletion(supabase: any, userId: string, reconversionId: string, userRole: string) {
  const errors: string[] = []

  // Only superadmins can delete reconversions
  if (userRole !== 'superadmin') {
    errors.push('Solo superadministradores pueden eliminar reconversiones')
    return { valid: false, errors }
  }

  // Verify reconversion exists
  const { data: reconversion } = await supabase
    .from('reconversiones_new')
    .select('id, estado, company_name')
    .eq('id', reconversionId)
    .single()

  if (!reconversion) {
    errors.push('Reconversión no encontrada')
  } else if (reconversion.estado === 'matching' || reconversion.estado === 'negociacion') {
    errors.push('No se puede eliminar una reconversión en proceso. Cámbiela a otro estado primero.')
  }

  return { valid: errors.length === 0, errors }
}

// Rate limiting is now handled by the database function check_rate_limit
