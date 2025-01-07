import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface RecentSkillsProps {
  skills: string[];
}

const RecentSkills = ({ skills }: RecentSkillsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="mr-2 h-4 w-4" />
          Recent Skills
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {skills.slice(0, 5).map((skill, index) => (
            <div key={index} className="text-sm">{skill}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSkills;