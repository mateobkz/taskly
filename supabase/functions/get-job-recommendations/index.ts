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
    
    const dislikedRoles = new Set(
      feedbackHistory
        ?.filter(f => !f.feedback)
        .map(f => f.role.toLowerCase())
    );
    
    const likedCompanies = new Set(
      feedbackHistory
        ?.filter(f => f.feedback)
        .map(f => f.company.toLowerCase())
    );

    const dislikedCompanies = new Set(
      feedbackHistory
        ?.filter(f => !f.feedback)
        .map(f => f.company.toLowerCase())
    );

    // Generate base recommendations with more variety
    const allRecommendations = [
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
      },
      {
        role: "Backend Engineer",
        companies: ["LinkedIn", "Twitter", "Uber"],
        jobLinks: [
          { company: "LinkedIn", url: "https://careers.linkedin.com/" },
          { company: "Twitter", url: "https://careers.twitter.com/" },
          { company: "Uber", url: "https://www.uber.com/us/en/careers/" }
        ]
      },
      {
        role: "DevOps Engineer",
        companies: ["GitLab", "Docker", "HashiCorp"],
        jobLinks: [
          { company: "GitLab", url: "https://about.gitlab.com/jobs/" },
          { company: "Docker", url: "https://www.docker.com/careers/" },
          { company: "HashiCorp", url: "https://www.hashicorp.com/jobs" }
        ]
      }
    ];

    // Filter out disliked roles and companies
    let filteredRecommendations = allRecommendations.filter(rec => {
      const isRoleDisliked = dislikedRoles.has(rec.role.toLowerCase());
      const areAllCompaniesDisliked = rec.companies.every(company => 
        dislikedCompanies.has(company.toLowerCase())
      );
      return !isRoleDisliked && !areAllCompaniesDisliked;
    });

    // If no recommendations left after filtering, reset to all recommendations
    if (filteredRecommendations.length === 0) {
      filteredRecommendations = allRecommendations;
    }

    // Score and sort recommendations based on likes
    const scoredRecommendations = filteredRecommendations.map(rec => {
      let score = 0;
      
      // Add points for liked roles
      if (likedRoles.has(rec.role.toLowerCase())) {
        score += 3;
      }
      
      // Add points for each liked company
      rec.companies.forEach(company => {
        if (likedCompanies.has(company.toLowerCase())) {
          score += 1;
        }
      });
      
      return { ...rec, score };
    }).sort((a, b) => b.score - a.score);

    // Take top 3 recommendations and add context
    const recommendations = scoredRecommendations.slice(0, 3).map(rec => ({
      ...rec,
      reasoning: `Based on your profile${profile?.position ? ` as a ${profile.position}` : ''} and your feedback history, 
                 this role aligns with your interests${rec.score > 0 ? ' and previous preferences' : ''}.`,
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
    }));

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