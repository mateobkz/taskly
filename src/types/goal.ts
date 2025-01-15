export type Goal = {
  id: number;
  title: string;
  target_value: number;
  current_value: number;
  period: 'Daily' | 'Weekly' | 'Monthly';
  category: string;
  start_date: string;
  end_date: string;
};