import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidationRequest {
  action: 'create' | 'update' | 'delete' | 'association_change'
  valoracionId?: string
  data?: {
    company_id?: string
    contact_id?: string
    company_name?: string
    client_name?: string
    fee_quoted?: number
    fee_charged?: number
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

    const { action, valoracionId, data }: ValidationRequest = await req.json()

    // Rate limiting básico por usuario
    const rateLimitKey = `valoracion_security_${user.id}`
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
        validationResult = await validateValoracionData(supabaseClient, user.id, data)
        break
      
      case 'association_change':
        validationResult = await validateAssociationChange(supabaseClient, user.id, valoracionId!, data)
        break
      
      case 'delete':
        validationResult = await validateDeletion(supabaseClient, user.id, valoracionId!)
        break
    }

    // Log de seguridad para intentos sospechosos
    if (!validationResult.valid) {
      await supabaseClient
        .from('valoracion_security_logs')
        .insert({
          valoracion_id: valoracionId,
          action: `validation_failed_${action}`,
          details: {
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

async function validateValoracionData(supabaseClient: any, userId: string, data: any) {
  const errors: string[] = []

  // Sanitizar y validar campos de texto
  if (data?.company_name) {
    const sanitized = data.company_name.trim()
    if (sanitized.length === 0) {
      errors.push('El nombre de la empresa es requerido')
    } else if (sanitized.length > 200) {
      errors.push('El nombre de la empresa no puede exceder 200 caracteres')
    }
  }

  if (data?.client_name) {
    const sanitized = data.client_name.trim()
    if (sanitized.length === 0) {
      errors.push('El nombre del cliente es requerido')
    } else if (sanitized.length > 200) {
      errors.push('El nombre del cliente no puede exceder 200 caracteres')
    }
  }

  // Validar honorarios
  if (data?.fee_quoted !== undefined) {
    if (data.fee_quoted < 0) {
      errors.push('El honorario cotizado no puede ser negativo')
    }
    if (data.fee_quoted > 10000000) { // 10M límite razonable
      errors.push('El honorario cotizado excede el límite permitido')
    }
  }

  if (data?.fee_charged !== undefined) {
    if (data.fee_charged < 0) {
      errors.push('El honorario cobrado no puede ser negativo')
    }
    if (data.fee_quoted && data.fee_charged > data.fee_quoted) {
      errors.push('El honorario cobrado no puede ser mayor al cotizado')
    }
  }

  // Validar asociaciones de empresa y contacto
  if (data?.company_id || data?.contact_id) {
    const { data: associationResult, error } = await supabaseClient
      .rpc('validate_valoracion_associations', {
        p_company_id: data.company_id || null,
        p_contact_id: data.contact_id || null
      })

    if (error || !associationResult) {
      errors.push('Error validando asociaciones de empresa/contacto')
    }
  }

  // Validar permisos del usuario sobre las entidades
  if (data?.company_id) {
    const { data: companyAccess } = await supabaseClient
      .from('companies')
      .select('id')
      .eq('id', data.company_id)
      .or(`created_by.eq.${userId},owner_id.eq.${userId}`)
      .neq('company_status', 'inactive')

    if (!companyAccess || companyAccess.length === 0) {
      // Verificar si es admin
      const { data: userRole } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .in('role', ['admin', 'superadmin'])

      if (!userRole || userRole.length === 0) {
        errors.push('No tienes permisos para asociar esta empresa')
      }
    }
  }

  if (data?.contact_id) {
    const { data: contactAccess } = await supabaseClient
      .from('contacts')
      .select('id')
      .eq('id', data.contact_id)
      .eq('created_by', userId)

    if (!contactAccess || contactAccess.length === 0) {
      // Verificar si es admin
      const { data: userRole } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .in('role', ['admin', 'superadmin'])

      if (!userRole || userRole.length === 0) {
        errors.push('No tienes permisos para asociar este contacto')
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

async function validateAssociationChange(supabaseClient: any, userId: string, valoracionId: string, data: any) {
  const errors: string[] = []

  // Verificar que el usuario tiene permisos para modificar la valoración
  const { data: valoracion } = await supabaseClient
    .from('valoraciones')
    .select('id, assigned_to, company_id, contact_id')
    .eq('id', valoracionId)
    .single()

  if (!valoracion) {
    errors.push('Valoración no encontrada')
    return { valid: false, errors }
  }

  // Obtener email del usuario actual
  const { data: user } = await supabaseClient.auth.getUser()
  const userEmail = user?.user?.email

  // Verificar permisos
  const hasAccess = valoracion.assigned_to === userEmail

  if (!hasAccess) {
    // Verificar si es admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'superadmin'])

    if (!userRole || userRole.length === 0) {
      errors.push('No tienes permisos para modificar las asociaciones de esta valoración')
    }
  }

  // Validar las nuevas asociaciones
  const dataValidation = await validateValoracionData(supabaseClient, userId, data)
  errors.push(...dataValidation.errors)

  return { valid: errors.length === 0, errors }
}

async function validateDeletion(supabaseClient: any, userId: string, valoracionId: string) {
  const errors: string[] = []

  // Solo admins pueden eliminar valoraciones
  const { data: userRole } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['admin', 'superadmin'])

  if (!userRole || userRole.length === 0) {
    errors.push('Solo los administradores pueden eliminar valoraciones')
  }

  // Verificar que la valoración existe
  const { data: valoracion } = await supabaseClient
    .from('valoraciones')
    .select('id, status, company_name')
    .eq('id', valoracionId)
    .single()

  if (!valoracion) {
    errors.push('Valoración no encontrada')
  } else if (valoracion.status === 'in_process') {
    errors.push('No se puede eliminar una valoración en proceso. Cámbiela a otro estado primero.')
  }

  return { valid: errors.length === 0, errors }
}

async function checkRateLimit(key: string): Promise<number> {
  // Implementación básica de rate limiting
  // En producción, usarías Redis o similar
  return 0 // Por ahora, siempre permitir
}