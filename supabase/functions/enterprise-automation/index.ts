Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'calculate_commission':
        return await calculateCommission(data);
      case 'process_performance_metrics':
        return await processPerformanceMetrics(data);
      case 'assign_territory':
        return await assignTerritory(data);
      case 'sync_integration':
        return await syncIntegration(data);
      case 'execute_workflow':
        return await executeWorkflow(data);
      default:
        return new Response(
          JSON.stringify({ error: 'Acción no reconocida' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('Error en enterprise automation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function calculateCommission(data) {
  const { collaboratorId, dealId, baseAmount, commissionRate, calculationType = 'percentage' } = data;

  try {
    let calculatedAmount = 0;
    
    switch (calculationType) {
      case 'percentage':
        calculatedAmount = baseAmount * (commissionRate / 100);
        break;
      case 'fixed':
        calculatedAmount = commissionRate;
        break;
      case 'tiered':
        // Lógica para comisiones escalonadas
        calculatedAmount = calculateTieredCommission(baseAmount, commissionRate);
        break;
      default:
        calculatedAmount = baseAmount * (commissionRate / 100);
    }

    const commission = {
      collaborator_id: collaboratorId,
      deal_id: dealId,
      calculation_type: calculationType,
      base_amount: baseAmount,
      commission_rate: commissionRate,
      calculated_amount: calculatedAmount,
      calculation_details: {
        calculated_at: new Date().toISOString(),
        calculation_method: calculationType,
        breakdown: { base: baseAmount, rate: commissionRate, result: calculatedAmount }
      },
      status: 'calculated'
    };

    console.log('Comisión calculada:', commission);

    return new Response(
      JSON.stringify({ 
        success: true, 
        commission,
        message: `Comisión calculada: €${calculatedAmount.toFixed(2)}`
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error calculating commission:', error);
    throw error;
  }
}

function calculateTieredCommission(amount, tiers) {
  let totalCommission = 0;
  let remainingAmount = amount;

  // Si tiers es un número, usar comisión simple
  if (typeof tiers === 'number') {
    return amount * (tiers / 100);
  }

  // Si tiers es un array de escalones
  if (Array.isArray(tiers)) {
    for (const tier of tiers) {
      const { threshold, rate } = tier;
      const tierAmount = Math.min(remainingAmount, threshold);
      totalCommission += tierAmount * (rate / 100);
      remainingAmount -= tierAmount;
      
      if (remainingAmount <= 0) break;
    }
  }

  return totalCommission;
}

async function processPerformanceMetrics(data) {
  const { collaboratorId, periodStart, periodEnd } = data;

  try {
    // Simular cálculos de performance
    const performance = {
      collaborator_id: collaboratorId,
      period_start: periodStart,
      period_end: periodEnd,
      total_revenue: Math.floor(Math.random() * 100000) + 50000,
      deals_closed: Math.floor(Math.random() * 20) + 5,
      leads_generated: Math.floor(Math.random() * 50) + 20,
      conversion_rate: Math.random() * 30 + 10,
      performance_score: Math.floor(Math.random() * 40) + 60,
      ranking_position: null
    };

    console.log('Performance metrics procesadas:', performance);

    return new Response(
      JSON.stringify({ 
        success: true, 
        performance,
        message: 'Métricas de performance actualizadas'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error processing performance metrics:', error);
    throw error;
  }
}

async function assignTerritory(data) {
  const { collaboratorId, territoryId, assignmentType = 'primary' } = data;

  try {
    const assignment = {
      collaborator_id: collaboratorId,
      territory_id: territoryId,
      assignment_type: assignmentType,
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: null
    };

    console.log('Territorio asignado:', assignment);

    return new Response(
      JSON.stringify({ 
        success: true, 
        assignment,
        message: 'Territorio asignado correctamente'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error assigning territory:', error);
    throw error;
  }
}

async function syncIntegration(data) {
  const { integrationId, userId, configuration } = data;

  try {
    // Simular sincronización de integración
    const syncResult = {
      integration_id: integrationId,
      user_id: userId,
      sync_status: 'active',
      last_sync: new Date().toISOString(),
      sync_details: {
        records_processed: Math.floor(Math.random() * 100) + 10,
        errors: 0,
        warnings: Math.floor(Math.random() * 3)
      }
    };

    console.log('Integración sincronizada:', syncResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        syncResult,
        message: 'Integración sincronizada correctamente'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error syncing integration:', error);
    throw error;
  }
}

async function executeWorkflow(data) {
  const { workflowId, context } = data;

  try {
    // Simular ejecución de workflow
    const execution = {
      workflow_id: workflowId,
      execution_context: context,
      started_at: new Date().toISOString(),
      status: 'running',
      execution_logs: [
        { step: 1, action: 'trigger_activated', timestamp: new Date().toISOString() },
        { step: 2, action: 'condition_evaluated', result: true, timestamp: new Date().toISOString() },
        { step: 3, action: 'action_executed', timestamp: new Date().toISOString() }
      ],
      performance_metrics: {
        execution_time_ms: Math.floor(Math.random() * 1000) + 100,
        steps_completed: 3,
        steps_total: 5
      }
    };

    // Simular finalización después de un delay
    setTimeout(() => {
      execution.status = 'completed';
      execution.completed_at = new Date().toISOString();
      console.log('Workflow completado:', execution);
    }, 2000);

    console.log('Workflow iniciado:', execution);

    return new Response(
      JSON.stringify({ 
        success: true, 
        execution,
        message: 'Workflow ejecutado correctamente'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error executing workflow:', error);
    throw error;
  }
}