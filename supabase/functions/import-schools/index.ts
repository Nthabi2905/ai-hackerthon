import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { schools } = await req.json()
    
    console.log(`Importing ${schools.length} schools`)

    // Insert schools in batches of 100
    const batchSize = 100
    for (let i = 0; i < schools.length; i += batchSize) {
      const batch = schools.slice(i, i + batchSize)
      
      const { error } = await supabaseClient
        .from('schools')
        .upsert(batch, { onConflict: 'nat_emis' })
      
      if (error) {
        console.error(`Error importing batch ${i / batchSize}:`, error)
        throw error
      }
      
      console.log(`Imported batch ${i / batchSize + 1}`)
    }

    return new Response(
      JSON.stringify({ success: true, imported: schools.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})