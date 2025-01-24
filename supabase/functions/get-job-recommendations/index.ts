import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json();
    console.log('Processing request for user:', userId);

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

    console.log('Retrieved profile:', profile);
    console.log('Recent applications:', recentApplications);

    // Generate recommendations based on profile and applications
    const recommendations = [
      {
        role: profile?.position ? `Senior ${profile.position}` : "Software Engineer",
        companies: ["Google", "Microsoft", "Amazon"],
        reasoning: "Based on your current role and skills, these tech giants would be a great next step in your career.",
        skillsToHighlight: profile?.skills?.slice(0, 3) || ["JavaScript", "React", "TypeScript"],
        skillsToDevelope: ["System Design", "Cloud Architecture", "Team Leadership"]
      },
      {
        role: "Tech Lead",
        companies: ["Stripe", "Square", "Shopify"],
        reasoning: "Your experience in software development and recent applications show you're ready for a leadership role.",
        skillsToHighlight: profile?.skills?.slice(0, 3) || ["Project Management", "Technical Architecture", "Mentorship"],
        skillsToDevelope: ["Strategic Planning", "Cross-functional Leadership", "Product Strategy"]
      },
      {
        role: "Engineering Manager",
        companies: ["Meta", "LinkedIn", "Twitter"],
        reasoning: "With your background, transitioning into engineering management could be a natural progression.",
        skillsToHighlight: profile?.skills?.slice(0, 3) || ["Team Leadership", "Technical Strategy", "Communication"],
        skillsToDevelope: ["People Management", "Organizational Development", "Budget Planning"]
      }
    ];

    console.log('Generated recommendations:', recommendations);

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