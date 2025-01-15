import { Database } from "@/integrations/supabase/types";

export type Goal = Database['public']['Tables']['goals']['Row'];