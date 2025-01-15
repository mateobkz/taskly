export type Goal = {
  id: number;
  title: string;
  target_value: number;
  current_value: number | null;
  period: 'Daily' | 'Weekly' | 'Monthly';
  category: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
};