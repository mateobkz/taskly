import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart, HeartCrack } from "lucide-react";
import { JobRecommendation } from "./types";

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
  return (
    <div className="space-y-4 p-4 rounded-lg bg-white/50">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{recommendation.role}</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(recommendation.role, recommendation.companies[0], true)}
            className={`${
              hasFeedback(recommendation.role, recommendation.companies[0], true)
                ? 'bg-green-100'
                : ''
            } text-green-600 hover:text-green-700 hover:bg-green-50`}
          >
            <Heart className="h-4 w-4" />
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
            <HeartCrack className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Target Companies:</p>
        <div className="flex flex-wrap gap-2">
          {recommendation.companies.map((company, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Badge variant="secondary">
                {company}
              </Badge>
              {recommendation.jobLinks?.find(link => link.company === company) && (
                <a
                  href={recommendation.jobLinks.find(link => link.company === company)?.url}
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