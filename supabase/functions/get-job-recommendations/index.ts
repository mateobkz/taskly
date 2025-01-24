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

    // Fetch user profile with skills and experience
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('Retrieved profile:', profile);

    // Fetch user's tasks to analyze experience
    const { data: tasks } = await supabase
      .from('tasks')
      .select('skills_acquired, difficulty')
      .eq('user_id', userId);

    console.log('Retrieved tasks:', tasks);

    // Extract all skills from tasks
    const taskSkills = new Set(
      tasks?.flatMap(task => 
        task.skills_acquired.split(',').map(s => s.trim().toLowerCase())
      ) || []
    );

    // Combine profile skills and task skills
    const allUserSkills = new Set([
      ...(profile?.skills || []).map(s => s.toLowerCase()),
      ...taskSkills
    ]);

    console.log('Combined user skills:', Array.from(allUserSkills));

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

    // Define role categories based on skills
    const roleCategories = {
      frontend: ['react', 'javascript', 'typescript', 'css', 'html'],
      backend: ['python', 'java', 'node', 'sql', 'api'],
      fullstack: ['react', 'node', 'javascript', 'api', 'fullstack'],
      devops: ['aws', 'docker', 'kubernetes', 'ci/cd', 'linux'],
      mobile: ['react native', 'ios', 'android', 'swift', 'kotlin'],
      ai: ['python', 'machine learning', 'tensorflow', 'pytorch', 'data science']
    };

    // Generate recommendations based on skill matches
    const generateRecommendations = () => {
      const recommendations = [];
      
      // Calculate skill match for each role category
      const categoryMatches = Object.entries(roleCategories).map(([category, skills]) => {
        const matchCount = skills.filter(skill => 
          Array.from(allUserSkills).some(userSkill => 
            userSkill.includes(skill) || skill.includes(userSkill)
          )
        ).length;
        return { category, matchScore: matchCount / skills.length };
      });

      // Sort categories by match score
      categoryMatches.sort((a, b) => b.matchScore - a.matchScore);
      console.log('Category matches:', categoryMatches);

      // Generate recommendations for top matching categories
      for (const { category, matchScore } of categoryMatches) {
        if (matchScore > 0.2) { // Only recommend if there's at least some skill match
          let recommendation;
          switch (category) {
            case 'frontend':
              recommendation = {
                role: "Frontend Developer",
                companies: ["Meta", "Airbnb", "Spotify"],
                jobLinks: [
                  { company: "Meta", url: "https://www.metacareers.com/jobs" },
                  { company: "Airbnb", url: "https://careers.airbnb.com" },
                  { company: "Spotify", url: "https://www.spotifyjobs.com/search-jobs" }
                ]
              };
              break;
            case 'backend':
              recommendation = {
                role: "Backend Engineer",
                companies: ["Amazon", "Stripe", "MongoDB"],
                jobLinks: [
                  { company: "Amazon", url: "https://www.amazon.jobs" },
                  { company: "Stripe", url: "https://stripe.com/jobs" },
                  { company: "MongoDB", url: "https://www.mongodb.com/careers" }
                ]
              };
              break;
            case 'fullstack':
              recommendation = {
                role: "Full Stack Developer",
                companies: ["Shopify", "GitHub", "Digital Ocean"],
                jobLinks: [
                  { company: "Shopify", url: "https://www.shopify.com/careers" },
                  { company: "GitHub", url: "https://github.com/about/careers" },
                  { company: "Digital Ocean", url: "https://www.digitalocean.com/careers" }
                ]
              };
              break;
            case 'devops':
              recommendation = {
                role: "DevOps Engineer",
                companies: ["Google Cloud", "AWS", "Microsoft Azure"],
                jobLinks: [
                  { company: "Google Cloud", url: "https://careers.google.com" },
                  { company: "AWS", url: "https://aws.amazon.com/careers" },
                  { company: "Microsoft Azure", url: "https://careers.microsoft.com" }
                ]
              };
              break;
            case 'mobile':
              recommendation = {
                role: "Mobile Developer",
                companies: ["Apple", "Uber", "Instagram"],
                jobLinks: [
                  { company: "Apple", url: "https://www.apple.com/careers" },
                  { company: "Uber", url: "https://www.uber.com/us/en/careers" },
                  { company: "Instagram", url: "https://www.instagram.com/about/jobs" }
                ]
              };
              break;
            case 'ai':
              recommendation = {
                role: "AI Engineer",
                companies: ["OpenAI", "DeepMind", "Anthropic"],
                jobLinks: [
                  { company: "OpenAI", url: "https://openai.com/careers" },
                  { company: "DeepMind", url: "https://deepmind.com/careers" },
                  { company: "Anthropic", url: "https://www.anthropic.com/careers" }
                ]
              };
              break;
          }

          if (recommendation) {
            // Filter out disliked roles and companies
            if (!dislikedRoles.has(recommendation.role.toLowerCase())) {
              recommendation.companies = recommendation.companies.filter(
                company => !dislikedCompanies.has(company.toLowerCase())
              );
              recommendation.jobLinks = recommendation.jobLinks.filter(
                link => !dislikedCompanies.has(link.company.toLowerCase())
              );

              if (recommendation.companies.length > 0) {
                recommendations.push({
                  ...recommendation,
                  reasoning: `Based on your ${Array.from(allUserSkills).slice(0, 3).join(', ')} skills${
                    profile?.position ? ` and experience as ${profile.position}` : ''
                  }, this ${category} role aligns well with your profile.`,
                  skillsToHighlight: Array.from(allUserSkills).slice(0, 5),
                  skillsToDevelope: roleCategories[category].filter(
                    skill => !Array.from(allUserSkills).some(userSkill => 
                      userSkill.includes(skill) || skill.includes(userSkill)
                    )
                  )
                });
              }
            }
          }
        }
      }

      return recommendations;
    };

    const recommendations = generateRecommendations();
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