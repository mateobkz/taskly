import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { taskId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch the task
    const { data: task, error: fetchError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (fetchError) throw fetchError

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    const prompt = `
    Task Title: ${task.title}
    Current Description: ${task.description}
    Current Skills: ${task.skills_acquired}
    Current Insights: ${task.key_insights}

    Please enhance this task information by:
    1. Making the description more detailed and professional
    2. Expanding the list of skills to be more comprehensive
    3. Providing deeper insights about the learning experience and key takeaways

    Format the response as JSON with these fields:
    - enhancedDescription
    - enhancedSkills (comma-separated)
    - enhancedInsights
    `

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional task enhancement assistant. Your goal is to make task descriptions more detailed, identify additional relevant skills, and provide deeper insights. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })

    const enhancedContent = JSON.parse(completion.data.choices[0].message.content)

    return new Response(
      JSON.stringify(enhancedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})