import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface UserProfile {
  skills: string[];
  position: string;
  company_name: string;
  learning_goals: string;
}

interface Task {
  skills_acquired: string;
  related_position: string;
  related_company: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user ID from request
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Error getting user');
    }

    console.log('Fetching recommendations for user:', user.id);

    // Fetch user profile data
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Error fetching profile');
    }

    const profile = profileData as UserProfile;
    console.log('User profile:', profile);

    // Fetch user's completed tasks
    const { data: tasksData, error: tasksError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'Completed');

    if (tasksError) {
      throw new Error('Error fetching tasks');
    }

    const tasks = tasksData as Task[];
    console.log('User completed tasks:', tasks);

    // Combine skills from profile and tasks
    const allSkills = new Set([
      ...(profile.skills || []),
      ...tasks.map(task => task.skills_acquired).filter(Boolean)
    ]);

    // Generate personalized job recommendations based on user data
    const recommendations = generateRecommendations(
      Array.from(allSkills),
      profile.position,
      profile.learning_goals,
      tasks
    );

    return new Response(
      JSON.stringify({
        recommendations,
        metadata: {
          skills: Array.from(allSkills),
          current_position: profile.position,
          learning_goals: profile.learning_goals
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function generateRecommendations(
  skills: string[],
  currentPosition: string,
  learningGoals: string,
  completedTasks: Task[]
) {
  // Sample job titles based on common career progression
  const jobTitles = {
    'Software Engineer': [
      'Senior Software Engineer',
      'Lead Developer',
      'Technical Architect',
      'Engineering Manager'
    ],
    'Data Analyst': [
      'Senior Data Analyst',
      'Data Scientist',
      'Analytics Manager',
      'Business Intelligence Manager'
    ],
    'Product Manager': [
      'Senior Product Manager',
      'Product Director',
      'Head of Product',
      'VP of Product'
    ],
    'Designer': [
      'Senior Designer',
      'Design Lead',
      'Design Manager',
      'Creative Director'
    ]
  };

  // Get relevant job titles based on current position or default to software roles
  const relevantTitles = jobTitles[currentPosition] || jobTitles['Software Engineer'];

  // Generate recommendations based on skills and career progression
  const recommendations = relevantTitles.map(title => {
    // Calculate match score based on skills and learning goals
    const matchScore = calculateMatchScore(skills, title, learningGoals);

    return {
      title,
      company: getRelevantCompany(completedTasks, title),
      requiredSkills: getRequiredSkills(skills, title),
      matchScore,
      description: generateJobDescription(title, skills),
    };
  });

  // Sort by match score and return top recommendations
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

function calculateMatchScore(
  userSkills: string[],
  jobTitle: string,
  learningGoals: string
): number {
  let score = 50; // Base score

  // Adjust score based on skills
  const relevantSkills = getRequiredSkills(userSkills, jobTitle);
  const skillsMatch = relevantSkills.filter(skill => 
    userSkills.some(userSkill => 
      userSkill.toLowerCase().includes(skill.toLowerCase())
    )
  ).length;

  score += (skillsMatch / relevantSkills.length) * 30;

  // Adjust score based on learning goals alignment
  if (learningGoals && jobTitle.toLowerCase().includes(learningGoals.toLowerCase())) {
    score += 20;
  }

  return Math.min(100, score);
}

function getRelevantCompany(tasks: Task[], jobTitle: string): string {
  // Get unique companies from tasks
  const companies = [...new Set(tasks
    .map(task => task.related_company)
    .filter(Boolean)
  )];

  // If we have companies from tasks, use one of them
  if (companies.length > 0) {
    return companies[Math.floor(Math.random() * companies.length)];
  }

  // Fallback companies
  const techCompanies = [
    'Google',
    'Microsoft',
    'Amazon',
    'Apple',
    'Meta',
    'Netflix',
    'Salesforce',
    'Adobe'
  ];

  return techCompanies[Math.floor(Math.random() * techCompanies.length)];
}

function getRequiredSkills(userSkills: string[], jobTitle: string): string[] {
  // Base skills for all positions
  const baseSkills = ['Communication', 'Problem Solving', 'Team Collaboration'];

  // Add role-specific skills
  const roleSkills = {
    'Software Engineer': ['JavaScript', 'React', 'Node.js', 'API Design'],
    'Senior Software Engineer': ['System Design', 'Mentoring', 'Architecture'],
    'Technical Architect': ['Cloud Architecture', 'Technical Leadership', 'Strategy'],
    'Engineering Manager': ['Team Leadership', 'Project Management', 'Agile'],
    'Data Analyst': ['SQL', 'Python', 'Data Visualization', 'Statistics'],
    'Data Scientist': ['Machine Learning', 'Deep Learning', 'Big Data'],
    'Product Manager': ['Product Strategy', 'User Research', 'Roadmap Planning'],
    'Designer': ['UI Design', 'UX Research', 'Design Systems'],
  };

  return [...baseSkills, ...(roleSkills[jobTitle] || [])];
}

function generateJobDescription(title: string, skills: string[]): string {
  const descriptions = {
    'Software Engineer': 'Build and maintain scalable applications using modern technologies.',
    'Senior Software Engineer': 'Lead technical initiatives and mentor junior developers.',
    'Technical Architect': 'Design system architecture and make key technical decisions.',
    'Engineering Manager': 'Lead and grow engineering teams while driving technical excellence.',
    'Data Analyst': 'Analyze data to provide actionable insights for business decisions.',
    'Data Scientist': 'Apply advanced analytics and machine learning to solve complex problems.',
    'Product Manager': 'Drive product strategy and execution in collaboration with cross-functional teams.',
    'Designer': 'Create intuitive and engaging user experiences across products.',
  };

  return descriptions[title] || 
    `Apply your expertise in ${skills.slice(0, 3).join(', ')} to drive innovation and growth.`;
}