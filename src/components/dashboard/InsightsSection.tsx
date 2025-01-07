import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BookOpen, Target } from "lucide-react";
import { Task } from "@/types/task";

interface InsightsSectionProps {
  tasks: Task[];
}

const InsightsSection = ({ tasks }: InsightsSectionProps) => {
  const getInsights = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyTasks = tasks.filter(task => 
      new Date(task.date_completed) >= oneMonthAgo
    );

    // Calculate top skill
    const skillCount: { [key: string]: number } = {};
    monthlyTasks.forEach(task => {
      task.skills_acquired.split(',').forEach(skill => {
        const trimmedSkill = skill.trim();
        skillCount[trimmedSkill] = (skillCount[trimmedSkill] || 0) + 1;
      });
    });
    const topSkill = Object.entries(skillCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Calculate most productive day
    const dayCount: { [key: string]: number } = {};
    monthlyTasks.forEach(task => {
      const day = new Date(task.date_completed).toLocaleDateString('en-US', { weekday: 'long' });
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const mostProductiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Find areas for improvement (skills used less frequently)
    const leastUsedSkill = Object.entries(skillCount).sort((a, b) => a[1] - b[1])[0]?.[0];

    return { topSkill, mostProductiveDay, leastUsedSkill };
  };

  const insights = getInsights();

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Insights & Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.topSkill && (
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-500 mt-1" />
            <div>
              <p className="font-medium">Top Skill Performance</p>
              <p className="text-sm text-muted-foreground">
                {insights.topSkill} is your most-used skill this month!
              </p>
            </div>
          </div>
        )}
        
        {insights.mostProductiveDay && (
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-green-500 mt-1" />
            <div>
              <p className="font-medium">Productivity Pattern</p>
              <p className="text-sm text-muted-foreground">
                You're most productive on {insights.mostProductiveDay}s.
              </p>
            </div>
          </div>
        )}
        
        {insights.leastUsedSkill && (
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-orange-500 mt-1" />
            <div>
              <p className="font-medium">Growth Opportunity</p>
              <p className="text-sm text-muted-foreground">
                Consider improving your {insights.leastUsedSkill} skills.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsSection;