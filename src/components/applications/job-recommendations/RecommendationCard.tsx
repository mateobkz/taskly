import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Minus, Check, X } from "lucide-react";
import { JobRecommendation } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface RecommendationCardProps {
  recommendation: JobRecommendation;
  onFeedback: (role: string, company: string, isPositive: boolean) => Promise<void>;
  hasFeedback: (role: string, company: string, isPositive: boolean) => boolean;
}

const RecommendationCard = ({ 
  recommendation, 
  onFeedback,
  hasFeedback 
}: RecommendationCardProps) => {
  const { toast } = useToast();

  const handleLike = async (role: string, company: string) => {
    try {
      // First submit the feedback
      await onFeedback(role, company, true);

      // Then create an application for each company
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const jobLink = recommendation.jobLinks?.find(link => link.company === company)?.url;

      const { error } = await supabase
        .from('applications')
        .insert([{
          user_id: user.id,
          company_name: company,
          position: role,
          status: 'To Apply',
          application_url: jobLink || null,
          application_date: new Date().toISOString().split('T')[0],
        }]);

      if (error) throw error;

      toast({
        title: "Application Created",
        description: `Added ${role} at ${company} to your applications`,
      });
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to create application",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg bg-white/50">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{recommendation.role}</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLike(recommendation.role, recommendation.companies[0])}
            className={`${
              hasFeedback(recommendation.role, recommendation.companies[0], true)
                ? 'bg-green-100'
                : ''
            } text-green-600 hover:text-green-700 hover:bg-green-50`}
          >
            {hasFeedback(recommendation.role, recommendation.companies[0], true) ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(recommendation.role, recommendation.companies[0], false)}
            className={`${
              hasFeedback(recommendation.role, recommendation.companies[0], false)
                ? 'bg-red-100'
                : ''
            } text-red-600 hover:text-red-700 hover:bg-red-50`}
          >
            {hasFeedback(recommendation.role, recommendation.companies[0], false) ? (
              <X className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Target Companies:</p>
        <div className="flex flex-wrap gap-2">
          {recommendation.companies.map((company, idx) => {
            const jobLink = recommendation.jobLinks?.find(link => link.company === company);
            return (
              <div key={idx} className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-2">
                  {company}
                  {jobLink && (
                    <a
                      href={jobLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 ml-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(recommendation.role, company)}
                  className="h-6 w-6 p-0.5"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Skills to Highlight:</p>
        <div className="flex flex-wrap gap-2">
          {recommendation.skillsToHighlight.map((skill, idx) => (
            <Badge key={idx} variant="outline" className="bg-green-50">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Skills to Develop:</p>
        <div className="flex flex-wrap gap-2">
          {recommendation.skillsToDevelope.map((skill, idx) => (
            <Badge key={idx} variant="outline" className="bg-blue-50">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;