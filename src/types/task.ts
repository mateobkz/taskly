export type Task = {
  id: number;
  title: string;
  date_completed: string;
  date_started: string;
  date_ended: string;
  skills_acquired: string;
  difficulty: 'Low' | 'Medium' | 'High';
  description: string;
  key_insights: string | null;
  duration_minutes: number;
  priority: 'Low' | 'Medium' | 'High' | null;
  status: 'Not Started' | 'In Progress' | 'Completed' | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
};