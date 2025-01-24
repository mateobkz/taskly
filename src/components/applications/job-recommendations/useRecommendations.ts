import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JobRecommendation } from "./types";
import { useToast } from "@/components/ui/use-toast";

export const useRecommendations = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['jobRecommendations'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        console.log('Fetching recommendations for user:', user.id);
        const { data, error } = await supabase.functions.invoke('get-job-recommendations', {
          body: { userId: user.id },
        });

        if (error) {
          console.error('Error from edge function:', error);
          throw error;
        }

        console.log('Received recommendations:', data);
        return data.recommendations as JobRecommendation[];
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        toast({
          title: "Error",
          description: "Failed to fetch job recommendations",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: true,
  });
};