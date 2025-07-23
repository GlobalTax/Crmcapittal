
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, reconversionId, data }: ValidationRequest = await req.json()

    // Rate limiting básico por usuario
    const rateLimitKey = `reconversion_security_${user.id}`
    const rateLimitCount = await checkRateLimit(rateLimitKey)
    if (rateLimitCount > 50) { // 50 requests por minuto
      return new Response(
        JSON.stringify({ error: 'Demasiadas solicitudes. Intente de nuevo más tarde.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let validationResult = { valid: true, errors: [] as string[] }

    switch (action) {
      case 'create':
      case 'update':
        validationResult = await validateReconversionData(supabaseClient, user.id, data)
        break
      
      case 'assignment_change':
        validationResult = await validateAssignmentChange(supabaseClient, user.id, reconversionId!, data)
        break
      
      case 'delete':
        validationResult = await validateDeletion(supabaseClient, user.id, reconversionId!)
        break
    }

    // Log de seguridad para intentos sospechosos
    if (!validationResult.valid) {
      await supabaseClient
        .from('reconversion_audit_logs')
        .insert({
          reconversion_id: reconversionId,
          action_type: `validation_failed_${action}`,
          action_description: 'Validación de seguridad falló',
          new_data: {
            errors: validationResult.errors,
            attempted_data: data,
            user_agent: req.headers.get('User-Agent'),
            ip: req.headers.get('x-forwarded-for') || 'unknown'
          },
          severity: 'medium',
          user_id: user.id
        })
    }

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en validación de seguridad:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
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

async function validateAssignmentChange(supabaseClient: any, userId: string, reconversionId: string, data: any) {
  const errors: string[] = []

  // Verificar que el usuario tiene permisos para modificar la reconversión
  const { data: hasPermission } = await supabaseClient
    .rpc('has_reconversion_permission', {
      p_reconversion_id: reconversionId,
      p_action: 'update'
    })

  if (!hasPermission) {
    errors.push('No tienes permisos para modificar las asignaciones de esta reconversión')
  }

  // Validar que el usuario asignado existe
  if (data?.assigned_to) {
    const { data: assignedUser } = await supabaseClient
      .from('auth.users')
      .select('id')
      .eq('id', data.assigned_to)
      .single()

    if (!assignedUser) {
      errors.push('El usuario asignado no existe')
    }
  }

  return { valid: errors.length === 0, errors }
}

async function validateDeletion(supabaseClient: any, userId: string, reconversionId: string) {
  const errors: string[] = []

  // Solo admins pueden eliminar reconversiones
  const { data: userRole } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['admin', 'superadmin'])

  if (!userRole || userRole.length === 0) {
    errors.push('Solo los administradores pueden eliminar reconversiones')
  }

  // Verificar que la reconversión existe
  const { data: reconversion } = await supabaseClient
    .from('reconversiones')
    .select('id, status, company_name')
    .eq('id', reconversionId)
    .single()

  if (!reconversion) {
    errors.push('Reconversión no encontrada')
  } else if (reconversion.status === 'en_progreso') {
    errors.push('No se puede eliminar una reconversión en progreso. Cámbiela a otro estado primero.')
  }

  return { valid: errors.length === 0, errors }
}

async function checkRateLimit(key: string): Promise<number> {
  // Implementación básica de rate limiting
  // En producción, usarías Redis o similar
  return 0 // Por ahora, siempre permitir
}
