import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFeedbackHistory = () => {
  return useQuery({
    queryKey: ['jobFeedback'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        console.log('Fetching feedback history for user:', user.id);
        const { data, error } = await supabase
          .from('job_recommendation_feedback')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        console.log('Retrieved feedback history:', data);
        return data;
      } catch (error) {
        console.error('Error fetching feedback history:', error);
        return [];
      }
    },
    enabled: true,
  });
};