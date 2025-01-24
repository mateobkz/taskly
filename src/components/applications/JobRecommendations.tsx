import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface JobRecommendation {
  role: string;
  companies: string[];
  reasoning: string;
  skillsToHighlight: string[];
  skillsToDevelope: string[];
}

const JobRecommendations = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: recommendations, refetch, isLoading } = useQuery({
    queryKey: ['jobRecommendations'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data, error } = await supabase.functions.invoke('get-job-recommendations', {
          body: { userId: user.id },
        });

        if (error) throw error;
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
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
            <h3 className="text-lg font-semibold">{rec.role}</h3>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Target Companies:</p>
              <div className="flex flex-wrap gap-2">
                {rec.companies.map((company, idx) => (
                  <Badge key={idx} variant="secondary">
                    {company}
                  </Badge>
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