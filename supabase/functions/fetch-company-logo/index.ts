import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { companyName } = await req.json()
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // Use OpenAI to generate a search query
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates search queries for company logos.'
          },
          {
            role: 'user',
            content: `Generate a search query to find the official logo of ${companyName}. The query should be specific to find high-quality, official logos.`
          }
        ],
      }),
    })

    const openaiData = await openaiResponse.json()
    const searchQuery = openaiData.choices[0].message.content

    // Use the generated query to search for images
    const searchResponse = await fetch(
      `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(searchQuery)}&count=1`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': Deno.env.get('BING_API_KEY')!,
        },
      }
    )

    const searchData = await searchResponse.json()
    const logoUrl = searchData.value[0]?.contentUrl

    if (logoUrl) {
      // Update the user's profile with the logo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ company_logo_url: logoUrl })
        .eq('company_name', companyName)

      if (updateError) throw updateError
    }

    return new Response(
      JSON.stringify({ logoUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})