import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { taskDescription, userId, isInitialRequest = true } = await req.json();
    console.log('Processing task description:', taskDescription, 'for user:', userId);

    if (!taskDescription) {
      throw new Error('Task description is required');
    }

    const { data: recentTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (tasksError) {
      console.error('Error fetching recent tasks:', tasksError);
      throw new Error('Failed to fetch context');
    }

    const recentTasksContext = recentTasks?.map(task => ({
      title: task.title,
      skills: task.skills_acquired,
      difficulty: task.difficulty
    }));

    const systemPrompt = isInitialRequest ? 
      `You are a task analysis assistant that helps optimize task descriptions and ensures they align with the user's learning journey. 
      Recent tasks context: ${JSON.stringify(recentTasksContext)}
      
      If you need clarification, respond with a JSON object containing:
      {
        "needsClarification": true,
        "question": "Your specific question here",
        "reasoning": "Why you need this clarification"
      }
      
      If you have enough information, respond with a JSON object containing:
      {
        "needsClarification": false,
        "parsedTask": {
          "title": "Clear, professional title",
          "description": "Detailed, well-structured description",
          "date_started": "YYYY-MM-DD",
          "date_ended": "YYYY-MM-DD",
          "difficulty": "Low/Medium/High",
          "skills_acquired": "Comma-separated list",
          "key_insights": "Combined insights including both challenges and takeaways",
          "duration_minutes": 30
        }
      }

      IMPORTANT: Make sure to format the response as a valid JSON object with double quotes around property names and string values.` :
      `You are a task optimization assistant. Based on the clarification provided, generate the final task details.
      Format the response as a JSON object with the parsedTask structure as shown above.
      IMPORTANT: Make sure to format the response as a valid JSON object with double quotes around property names and string values.`;

    console.log('Sending request to OpenAI with system prompt:', systemPrompt);

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: taskDescription
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const data = await openAIResponse.json();
    console.log('OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(data.choices[0].message.content.trim());
      console.log('Successfully parsed response:', parsedResponse);
    } catch (error) {
      console.error('Error parsing OpenAI response as JSON:', error);
      console.log('Raw response content:', data.choices[0].message.content);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    if (typeof parsedResponse.needsClarification !== 'boolean') {
      throw new Error('Invalid response format: missing or invalid needsClarification field');
    }

    if (!parsedResponse.needsClarification && !parsedResponse.parsedTask) {
      throw new Error('Invalid response format: missing parsedTask when needsClarification is false');
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  } catch (error) {
    console.error('Error in parse-task function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process task description',
        details: error.stack 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});