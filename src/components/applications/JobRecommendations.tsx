import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, HeartCrack, Lightbulb, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface JobRecommendation {
  role: string;
  companies: string[];
  reasoning: string;
  skillsToHighlight: string[];
  skillsToDevelope: string[];
  jobLinks?: { company: string; url: string }[];
}

const JobRecommendations = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Query for job recommendations
  const { data: recommendations, refetch, isLoading } = useQuery({
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

  // Query for user's feedback history
  const { data: feedbackHistory, refetch: refetchFeedback } = useQuery({
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

  const handleRefresh = async () => {
    console.log('Refreshing recommendations...');
    setIsRefreshing(true);
    try {
      await refetch();
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
      await Promise.all([refetchFeedback(), refetch()]);

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

  // Helper function to check if user has already given feedback
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
          <div key={index} className="space-y-4 p-4 rounded-lg bg-white/50">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{rec.role}</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(rec.role, rec.companies[0], true)}
                  className={`${
                    hasFeedback(rec.role, rec.companies[0], true)
                      ? 'bg-green-100'
                      : ''
                  } text-green-600 hover:text-green-700 hover:bg-green-50`}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(rec.role, rec.companies[0], false)}
                  className={`${
                    hasFeedback(rec.role, rec.companies[0], false)
                      ? 'bg-red-100'
                      : ''
                  } text-red-600 hover:text-red-700 hover:bg-red-50`}
                >
                  <HeartCrack className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Target Companies:</p>
              <div className="flex flex-wrap gap-2">
                {rec.companies.map((company, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {company}
                    </Badge>
                    {rec.jobLinks?.find(link => link.company === company) && (
                      <a
                        href={rec.jobLinks.find(link => link.company === company)?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Skills to Highlight:</p>
              <div className="flex flex-wrap gap-2">
                {rec.skillsToHighlight.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="bg-green-50">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Skills to Develop:</p>
              <div className="flex flex-wrap gap-2">
                {rec.skillsToDevelope.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="bg-blue-50">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default JobRecommendations;