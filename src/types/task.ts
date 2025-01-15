import { Database } from "@/integrations/supabase/types";

export type Task = Database['public']['Tables']['tasks']['Row'] & {
  priority?: 'Low' | 'Medium' | 'High';
  status?: 'Not Started' | 'In Progress' | 'Completed';
};