export interface JobRecommendation {
  role: string;
  companies: string[];
  reasoning: string;
  skillsToHighlight: string[];
  skillsToDevelope: string[];
  jobLinks?: { company: string; url: string }[];
}