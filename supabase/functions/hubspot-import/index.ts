import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HubSpotCompany {
  id: string
  properties: {
    name?: string
    domain?: string
    industry?: string
    phone?: string
    city?: string
    state?: string
    country?: string
    website?: string
    description?: string
    annualrevenue?: string
    numberofemployees?: string
    founded_year?: string
  }
}

interface HubSpotContact {
  id: string
  properties: {
    firstname?: string
    lastname?: string
    email?: string
    phone?: string
    jobtitle?: string
    company?: string
    lifecyclestage?: string
    hubspot_owner_id?: string
  }
  associations?: {
    companies?: { results: { id: string }[] }
  }
}

interface HubSpotDeal {
  id: string
  properties: {
    dealname?: string
    amount?: string
    dealstage?: string
    pipeline?: string
    closedate?: string
    createdate?: string
    hubspot_owner_id?: string
    description?: string
  }
  associations?: {
    companies?: { results: { id: string }[] }
    contacts?: { results: { id: string }[] }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header to extract user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      throw new Error('Invalid user')
    }

    const hubspotToken = Deno.env.get('HUBSPOT_ACCESS_TOKEN')
    if (!hubspotToken) {
      throw new Error('HubSpot access token not configured')
    }

    const { importType } = await req.json()

    console.log(`Starting ${importType} import for user ${user.id}`)

    const headers = {
      'Authorization': `Bearer ${hubspotToken}`,
      'Content-Type': 'application/json'
    }

    let importResults = {
      companies: 0,
      contacts: 0,
      deals: 0,
      errors: [] as string[]
    }

    // Import Companies
    if (importType === 'all' || importType === 'companies') {
      try {
        console.log('Fetching companies from HubSpot...')
        const companiesResponse = await fetch(
          'https://api.hubapi.com/crm/v3/objects/companies?limit=100&properties=name,domain,industry,phone,city,state,country,website,description,annualrevenue,numberofemployees,founded_year',
          { headers }
        )
        
        if (!companiesResponse.ok) {
          throw new Error(`HubSpot companies API error: ${companiesResponse.status}`)
        }

        const companiesData = await companiesResponse.json()
        console.log(`Found ${companiesData.results?.length || 0} companies`)

        for (const company of companiesData.results || []) {
          try {
            const companyData = {
              name: company.properties.name || 'Sin nombre',
              domain: company.properties.domain,
              industry: company.properties.industry,
              phone: company.properties.phone,
              city: company.properties.city,
              state: company.properties.state,
              country: company.properties.country || 'España',
              website: company.properties.website,
              description: company.properties.description,
              annual_revenue: company.properties.annualrevenue ? parseInt(company.properties.annualrevenue) : null,
              company_size: getCompanySize(company.properties.numberofemployees),
              founded_year: company.properties.founded_year ? parseInt(company.properties.founded_year) : null,
              created_by: user.id,
              external_id: company.id,
              source_table: 'hubspot_companies'
            }

            const { error } = await supabaseClient
              .from('companies')
              .upsert(companyData, { 
                onConflict: 'external_id',
                ignoreDuplicates: false 
              })

            if (error) {
              console.error('Error inserting company:', error)
              importResults.errors.push(`Company ${company.properties.name}: ${error.message}`)
            } else {
              importResults.companies++
            }
          } catch (err) {
            console.error('Error processing company:', err)
            importResults.errors.push(`Company processing error: ${err.message}`)
          }
        }
      } catch (err) {
        console.error('Companies import error:', err)
        importResults.errors.push(`Companies import: ${err.message}`)
      }
    }

    // Import Contacts
    if (importType === 'all' || importType === 'contacts') {
      try {
        console.log('Fetching contacts from HubSpot...')
        const contactsResponse = await fetch(
          'https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,phone,jobtitle,company,lifecyclestage&associations=companies',
          { headers }
        )
        
        if (!contactsResponse.ok) {
          throw new Error(`HubSpot contacts API error: ${contactsResponse.status}`)
        }

        const contactsData = await contactsResponse.json()
        console.log(`Found ${contactsData.results?.length || 0} contacts`)

        for (const contact of contactsData.results || []) {
          try {
            const name = `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim() || 'Sin nombre'
            
            // Find associated company
            let company_id = null
            if (contact.associations?.companies?.results?.length > 0) {
              const hubspotCompanyId = contact.associations.companies.results[0].id
              const { data: companyMatch } = await supabaseClient
                .from('companies')
                .select('id')
                .eq('external_id', hubspotCompanyId)
                .single()
              
              if (companyMatch) {
                company_id = companyMatch.id
              }
            }

            const contactData = {
              name,
              email: contact.properties.email,
              phone: contact.properties.phone,
              position: contact.properties.jobtitle,
              company: contact.properties.company,
              company_id,
              lifecycle_stage: mapLifecycleStage(contact.properties.lifecyclestage),
              contact_type: 'prospect',
              created_by: user.id,
              external_id: contact.id,
              source_table: 'hubspot_contacts'
            }

            const { error } = await supabaseClient
              .from('contacts')
              .upsert(contactData, { 
                onConflict: 'external_id',
                ignoreDuplicates: false 
              })

            if (error) {
              console.error('Error inserting contact:', error)
              importResults.errors.push(`Contact ${name}: ${error.message}`)
            } else {
              importResults.contacts++
            }
          } catch (err) {
            console.error('Error processing contact:', err)
            importResults.errors.push(`Contact processing error: ${err.message}`)
          }
        }
      } catch (err) {
        console.error('Contacts import error:', err)
        importResults.errors.push(`Contacts import: ${err.message}`)
      }
    }

    // Import Deals
    if (importType === 'all' || importType === 'deals') {
      try {
        console.log('Fetching deals from HubSpot...')
        const dealsResponse = await fetch(
          'https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,pipeline,closedate,createdate,description&associations=companies,contacts',
          { headers }
        )
        
        if (!dealsResponse.ok) {
          throw new Error(`HubSpot deals API error: ${dealsResponse.status}`)
        }

        const dealsData = await dealsResponse.json()
        console.log(`Found ${dealsData.results?.length || 0} deals`)

        for (const deal of dealsData.results || []) {
          try {
            // Find associated company and contact
            let contact_id = null
            if (deal.associations?.contacts?.results?.length > 0) {
              const hubspotContactId = deal.associations.contacts.results[0].id
              const { data: contactMatch } = await supabaseClient
                .from('contacts')
                .select('id')
                .eq('external_id', hubspotContactId)
                .single()
              
              if (contactMatch) {
                contact_id = contactMatch.id
              }
            }

            const dealData = {
              deal_name: deal.properties.dealname || 'Sin nombre',
              deal_value: deal.properties.amount ? parseFloat(deal.properties.amount) : null,
              deal_type: 'venta',
              description: deal.properties.description,
              contact_id,
              created_by: user.id,
              close_date: deal.properties.closedate ? new Date(deal.properties.closedate).toISOString() : null,
              is_active: true
            }

            const { error } = await supabaseClient
              .from('deals')
              .insert(dealData)

            if (error) {
              console.error('Error inserting deal:', error)
              importResults.errors.push(`Deal ${deal.properties.dealname}: ${error.message}`)
            } else {
              importResults.deals++
            }
          } catch (err) {
            console.error('Error processing deal:', err)
            importResults.errors.push(`Deal processing error: ${err.message}`)
          }
        }
      } catch (err) {
        console.error('Deals import error:', err)
        importResults.errors.push(`Deals import: ${err.message}`)
      }
    }

    console.log('Import completed:', importResults)

    return new Response(JSON.stringify({
      success: true,
      results: importResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Import error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

function getCompanySize(numberOfEmployees?: string): string {
  if (!numberOfEmployees) return '11-50'
  const num = parseInt(numberOfEmployees)
  if (num <= 10) return '1-10'
  if (num <= 50) return '11-50'
  if (num <= 200) return '51-200'
  if (num <= 1000) return '201-1000'
  return '1000+'
}

function mapLifecycleStage(stage?: string): string {
  switch (stage?.toLowerCase()) {
    case 'lead': return 'lead'
    case 'marketingqualifiedlead': return 'qualified_lead'
    case 'salesqualifiedlead': return 'qualified_lead'
    case 'opportunity': return 'opportunity'
    case 'customer': return 'cliente'
    case 'evangelist': return 'cliente'
    default: return 'lead'
  }
}