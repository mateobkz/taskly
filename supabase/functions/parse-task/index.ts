import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('Received request:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    const { taskDescription } = await req.json();
    console.log('Processing task description:', taskDescription);

    if (!taskDescription) {
      throw new Error('Task description is required');
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a task parser that extracts structured information from natural language descriptions.
              Return a JSON object with these fields:
              - title (string): A clear, concise title for the task
              - date_started (YYYY-MM-DD): The start date, default to today if not specified
              - date_ended (YYYY-MM-DD): The end date, default to today if not specified
              - difficulty (string): Must be exactly "Low", "Medium", or "High"
              - skills_acquired (string): Comma-separated list of skills
              Only return the JSON object, no other text.`
          },
          {
            role: 'user',
            content: taskDescription
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    console.log('OpenAI API response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const data = await openAIResponse.json();
    console.log('OpenAI response data:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    let parsedTask;
    try {
      parsedTask = JSON.parse(data.choices[0].message.content);
      console.log('Successfully parsed task:', parsedTask);

      // Validate the required fields
      if (!parsedTask.title || !parsedTask.difficulty || 
          !['Low', 'Medium', 'High'].includes(parsedTask.difficulty)) {
        throw new Error('Invalid task format returned from OpenAI');
      }
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e);
      throw new Error('Failed to parse task details');
    }

    return new Response(
      JSON.stringify({ parsedTask }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
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