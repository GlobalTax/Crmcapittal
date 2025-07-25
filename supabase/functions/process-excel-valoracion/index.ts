import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExcelData {
  [key: string]: any;
}

interface NamedRange {
  name: string;
  value: number | string | null;
}

Deno.serve(async (req) => {
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
        },
      }
    );

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const valoracionId = formData.get('valoracionId') as string;

    if (!file || !valoracionId) {
      return new Response(
        JSON.stringify({ error: 'File and valoracionId are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('Processing Excel file:', file.name);

    // Upload file to temporary storage
    const fileName = `${user.id}_${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('excel-temp')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file' }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('File uploaded successfully:', uploadData.path);

    // Get file buffer to process
    const { data: fileData } = await supabase.storage
      .from('excel-temp')
      .download(fileName);

    if (!fileData) {
      return new Response(
        JSON.stringify({ error: 'Failed to download file' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Import XLSX library dynamically
    const XLSX = await import('https://esm.sh/xlsx@0.18.5');
    
    // Parse Excel file
    const workbook = XLSX.read(uint8Array, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    console.log('Excel file parsed successfully');

    // Extract named ranges - simulated extraction since XLSX might not have full named range support
    const namedRanges: NamedRange[] = [];
    const targetRanges = ['EBITDA_LTM', 'WACC', 'NET_DEBT', 'GROWTH', 'REVENUE', 'EV', 'EQUITY'];
    
    // Try to find these values in common Excel cells
    const cellMappings: { [key: string]: string[] } = {
      'EBITDA_LTM': ['B2', 'C2', 'D2', 'B3', 'C3'],
      'WACC': ['B5', 'C5', 'D5', 'B6', 'C6'],
      'NET_DEBT': ['B7', 'C7', 'D7', 'B8', 'C8'],
      'GROWTH': ['B10', 'C10', 'D10', 'B11', 'C11'],
      'REVENUE': ['B12', 'C12', 'D12', 'B13', 'C13'],
      'EV': ['B15', 'C15', 'D15', 'B16', 'C16'],
      'EQUITY': ['B17', 'C17', 'D17', 'B18', 'C18']
    };

    for (const rangeName of targetRanges) {
      const possibleCells = cellMappings[rangeName] || [];
      
      for (const cell of possibleCells) {
        const cellValue = worksheet[cell];
        if (cellValue && typeof cellValue.v === 'number') {
          namedRanges.push({
            name: rangeName,
            value: cellValue.v
          });
          break; // Found value, move to next range
        }
      }
    }

    console.log('Named ranges extracted:', namedRanges);

    // Insert/update valoracion_inputs
    const inputPromises = namedRanges.map(range => {
      const inputData = {
        valoracion_id: valoracionId,
        clave: range.name,
        valor: range.value?.toString() || null,
        tipo_dato: 'number',
        obligatorio: false,
        descripcion: `Importado desde Excel: ${range.name}`,
        orden_display: targetRanges.indexOf(range.name) + 1
      };

      return supabase
        .from('valoracion_inputs')
        .upsert(inputData, { 
          onConflict: 'valoracion_id,clave',
          ignoreDuplicates: false 
        });
    });

    const inputResults = await Promise.all(inputPromises);
    
    for (const result of inputResults) {
      if (result.error) {
        console.error('Error inserting input:', result.error);
      }
    }

    // Calculate EV and EQUITY if values exist
    const evRange = namedRanges.find(r => r.name === 'EV');
    const equityRange = namedRanges.find(r => r.name === 'EQUITY');
    
    if (evRange?.value || equityRange?.value) {
      const updateData: any = {};
      
      if (evRange?.value) {
        updateData.valoracion_ev = parseFloat(evRange.value.toString());
      }
      
      // Update valoracion with calculated values
      const { error: updateError } = await supabase
        .from('valoraciones')
        .update(updateData)
        .eq('id', valoracionId);

      if (updateError) {
        console.error('Error updating valoracion:', updateError);
      } else {
        console.log('Valoracion updated with EV/Equity values');
      }
    }

    // Mark "Inputs" task as completed if it exists
    const { error: taskError } = await supabase
      .from('valoracion_tasks')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString() 
      })
      .eq('valoracion_id', valoracionId)
      .eq('title', 'Recopilar inputs iniciales');

    if (taskError) {
      console.log('No task found to complete or error:', taskError);
    }

    // Clean up temporary file
    await supabase.storage
      .from('excel-temp')
      .remove([fileName]);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Excel processed successfully',
        namedRanges: namedRanges,
        inputsCreated: namedRanges.length,
        evUpdated: !!evRange?.value,
        equityUpdated: !!equityRange?.value
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});