export type Task = {
  id: number;
  title: string;
  date_completed: string;
  skills_acquired: string;
  difficulty: 'Low' | 'Medium' | 'High';
  description: string;
  key_challenges: string;
  key_takeaways: string;
};