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
    console.log('Processing request for user:', userId);

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('Retrieved profile:', profile);

    // Fetch user's feedback history
    const { data: feedbackHistory } = await supabase
      .from('job_recommendation_feedback')
      .select('*')
      .eq('user_id', userId);

    console.log('Retrieved feedback history:', feedbackHistory);

    // Analyze feedback to determine preferences
    const likedRoles = new Set(
      feedbackHistory
        ?.filter(f => f.feedback)
        .map(f => f.role.toLowerCase())
    );
    
    const likedCompanies = new Set(
      feedbackHistory
        ?.filter(f => f.feedback)
        .map(f => f.company.toLowerCase())
    );

    // Generate base recommendations
    const baseRecommendations = [
      {
        role: "Software Engineer",
        companies: ["Google", "Microsoft", "Amazon"],
        jobLinks: [
          { company: "Google", url: "https://careers.google.com/jobs/results/" },
          { company: "Microsoft", url: "https://careers.microsoft.com/us/en/search-results" },
          { company: "Amazon", url: "https://www.amazon.jobs/en/" }
        ]
      },
      {
        role: "Frontend Developer",
        companies: ["Meta", "Apple", "Netflix"],
        jobLinks: [
          { company: "Meta", url: "https://www.metacareers.com/" },
          { company: "Apple", url: "https://www.apple.com/careers/us/" },
          { company: "Netflix", url: "https://jobs.netflix.com/" }
        ]
      },
      {
        role: "Full Stack Developer",
        companies: ["Stripe", "Square", "Shopify"],
        jobLinks: [
          { company: "Stripe", url: "https://stripe.com/jobs" },
          { company: "Square", url: "https://careers.squareup.com/us/en" },
          { company: "Shopify", url: "https://www.shopify.com/careers" }
        ]
      }
    ];

    // Customize recommendations based on profile and feedback
    const recommendations = baseRecommendations.map(rec => {
      // Prioritize recommendations similar to liked roles/companies
      const relevanceScore = 
        (likedRoles.has(rec.role.toLowerCase()) ? 2 : 0) +
        rec.companies.reduce((score, company) => 
          score + (likedCompanies.has(company.toLowerCase()) ? 1 : 0), 0);

      return {
        ...rec,
        reasoning: `Based on your profile${profile?.position ? ` as a ${profile.position}` : ''} and your feedback history, 
                   this role aligns with your interests${relevanceScore > 0 ? ' and previous preferences' : ''}.`,
        skillsToHighlight: [
          ...(profile?.skills?.slice(0, 3) || ["JavaScript", "React", "TypeScript"]),
          "Problem Solving",
          "Communication"
        ],
        skillsToDevelope: [
          "System Design",
          "Cloud Architecture",
          "Team Leadership",
          "Technical Architecture"
        ]
      };
    }).sort((a, b) => {
      // Sort by relevance to user's preferences
      const scoreA = likedRoles.has(a.role.toLowerCase()) ? 2 : 0;
      const scoreB = likedRoles.has(b.role.toLowerCase()) ? 2 : 0;
      return scoreB - scoreA;
    });

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