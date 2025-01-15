import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.20.1'

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
    console.log('Enhancing task:', taskId)

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

    if (fetchError) {
      console.error('Error fetching task:', fetchError)
      throw fetchError
    }

    console.log('Task fetched:', task)

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

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

    console.log('Sending prompt to OpenAI')

    const completion = await openai.chat.completions.create({
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

    console.log('Received response from OpenAI')

    const enhancedContent = JSON.parse(completion.choices[0].message.content)
    console.log('Parsed enhanced content:', enhancedContent)

    return new Response(
      JSON.stringify(enhancedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in enhance-task function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})