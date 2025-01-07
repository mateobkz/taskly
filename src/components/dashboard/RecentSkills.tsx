import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecentSkillsProps {
  skills: string[];
}

const RecentSkills = ({ skills }: RecentSkillsProps) => {
  return (
    <Card className="bg-purple-50/50 transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="mr-2 h-4 w-4" />
          Recent Skills
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 5).map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="transition-all duration-200 hover:bg-accent"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSkills;