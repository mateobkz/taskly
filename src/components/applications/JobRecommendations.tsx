import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RecommendationCard from "./job-recommendations/RecommendationCard";
import { useRecommendations } from "./job-recommendations/useRecommendations";
import { useFeedbackHistory } from "./job-recommendations/useFeedbackHistory";

const JobRecommendations = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { 
    data: recommendations, 
    refetch: refetchRecommendations, 
    isLoading 
  } = useRecommendations();

  const { 
    data: feedbackHistory, 
    refetch: refetchFeedback 
  } = useFeedbackHistory();

  const handleRefresh = async () => {
    console.log('Refreshing recommendations...');
    setIsRefreshing(true);
    try {
      await refetchRecommendations();
      toast({
        title: "Success",
        description: "Recommendations refreshed successfully",
      });
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to refresh recommendations",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFeedback = async (role: string, company: string, isPositive: boolean) => {
    try {
      console.log('Submitting feedback:', { role, company, isPositive });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('job_recommendation_feedback')
        .insert([
          {
            user_id: user.id,
            role,
            company,
            feedback: isPositive,
          }
        ]);

      if (error) throw error;

      // Refresh both feedback history and recommendations
      await Promise.all([refetchFeedback(), refetchRecommendations()]);

      toast({
        title: "Feedback Recorded",
        description: `Thanks for your feedback on ${role} at ${company}!`,
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "Error",
        description: "Failed to save feedback",
        variant: "destructive",
      });
    }
  };

  const hasFeedback = (role: string, company: string, isPositive: boolean) => {
    return feedbackHistory?.some(
      (f) => f.role === role && 
             f.company === company && 
             f.feedback === isPositive
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Job Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Job Recommendations
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {recommendations?.map((rec, index) => (
          <RecommendationCard
            key={index}
            recommendation={rec}
            onFeedback={handleFeedback}
            hasFeedback={hasFeedback}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default JobRecommendations;