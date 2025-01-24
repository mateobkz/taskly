import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json();

    // Fetch user profile and recent applications
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: recentApplications } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const prompt = `As a career advisor, analyze this user's profile and recent job applications to suggest personalized job recommendations. 
    
    User Profile:
    - Current Position: ${profile.position || 'Not specified'}
    - Current Company: ${profile.company_name || 'Not specified'}
    - Skills: ${profile.skills?.join(', ') || 'Not specified'}
    - Bio: ${profile.bio || 'Not specified'}
    
    Recent Applications:
    ${recentApplications?.map(app => `- ${app.position} at ${app.company_name}`).join('\n')}
    
    Based on this information, suggest 3 job recommendations. For each recommendation, include:
    1. The type of role they should consider
    2. Specific companies that would be a good fit
    3. Why this would be a good match
    4. Skills they should highlight
    5. Any skills they might want to develop
    
    Format the response as a JSON array of recommendations.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a career advisor helping users find their next job opportunity.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await openAIResponse.json();
    const recommendations = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-job-recommendations function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});