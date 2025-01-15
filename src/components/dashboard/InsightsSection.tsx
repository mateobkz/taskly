import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BookOpen, Target, Clock, Star } from "lucide-react";
import { Task } from "@/types/task";

interface InsightsSectionProps {
  tasks: Task[];
}

const InsightsSection = ({ tasks }: InsightsSectionProps) => {
  const getInsights = () => {
    console.log("Calculating insights from tasks:", tasks);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyTasks = tasks.filter(task => 
      new Date(task.date_completed) >= oneMonthAgo
    );

    console.log("Tasks from last month:", monthlyTasks.length);

    // Calculate skill frequency and growth
    const skillCount: { [key: string]: { count: number, dates: Date[] } } = {};
    monthlyTasks.forEach(task => {
      task.skills_acquired.split(',').forEach(skill => {
        const trimmedSkill = skill.trim();
        if (!skillCount[trimmedSkill]) {
          skillCount[trimmedSkill] = { count: 0, dates: [] };
        }
        skillCount[trimmedSkill].count += 1;
        skillCount[trimmedSkill].dates.push(new Date(task.date_completed));
      });
    });

    // Find top skill (most frequently used)
    const topSkill = Object.entries(skillCount)
      .sort((a, b) => b[1].count - a[1].count)[0];

    // Find growing skill (most recent entries)
    const growingSkill = Object.entries(skillCount)
      .sort((a, b) => {
        const aLatest = new Date(Math.max(...a[1].dates.map(d => d.getTime())));
        const bLatest = new Date(Math.max(...b[1].dates.map(d => d.getTime())));
        return bLatest.getTime() - aLatest.getTime();
      })[0];

    // Calculate productivity patterns
    const dayCount: { [key: string]: { count: number, totalMinutes: number } } = {};
    monthlyTasks.forEach(task => {
      const day = new Date(task.date_completed).toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayCount[day]) {
        dayCount[day] = { count: 0, totalMinutes: 0 };
      }
      dayCount[day].count += 1;
      dayCount[day].totalMinutes += task.duration_minutes;
    });

    const mostProductiveDay = Object.entries(dayCount)
      .sort((a, b) => b[1].totalMinutes - a[1].totalMinutes)[0];

    // Calculate average task duration trend
    const recentTasksDuration = monthlyTasks
      .slice(-5)
      .reduce((acc, task) => acc + task.duration_minutes, 0) / 5;
    
    const olderTasksDuration = monthlyTasks
      .slice(0, -5)
      .reduce((acc, task) => acc + task.duration_minutes, 0) / 
      Math.max(monthlyTasks.length - 5, 1);

    const durationTrend = recentTasksDuration - olderTasksDuration;

    console.log("Calculated insights:", {
      topSkill,
      growingSkill,
      mostProductiveDay,
      durationTrend
    });

    return {
      topSkill: topSkill?.[0],
      topSkillCount: topSkill?.[1].count,
      growingSkill: growingSkill?.[0],
      mostProductiveDay: mostProductiveDay?.[0],
      productiveTaskCount: mostProductiveDay?.[1].count,
      durationTrend
    };
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
            <Star className="h-5 w-5 text-yellow-500 mt-1" />
            <div>
              <p className="font-medium">Top Skill</p>
              <p className="text-sm text-muted-foreground">
                You've used {insights.topSkill} in {insights.topSkillCount} {insights.topSkillCount === 1 ? 'task' : 'tasks'} this month
              </p>
            </div>
          </div>
        )}
        
        {insights.growingSkill && (
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-green-500 mt-1" />
            <div>
              <p className="font-medium">Growing Skill</p>
              <p className="text-sm text-muted-foreground">
                {insights.growingSkill} is your most recently developed skill
              </p>
            </div>
          </div>
        )}
        
        {insights.mostProductiveDay && (
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-500 mt-1" />
            <div>
              <p className="font-medium">Peak Productivity</p>
              <p className="text-sm text-muted-foreground">
                You complete most tasks on {insights.mostProductiveDay}s 
                ({insights.productiveTaskCount} {insights.productiveTaskCount === 1 ? 'task' : 'tasks'})
              </p>
            </div>
          </div>
        )}

        {insights.durationTrend !== undefined && Math.abs(insights.durationTrend) > 5 && (
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-purple-500 mt-1" />
            <div>
              <p className="font-medium">Duration Trend</p>
              <p className="text-sm text-muted-foreground">
                {insights.durationTrend > 0 
                  ? "Your recent tasks are taking longer to complete"
                  : "You're completing tasks more quickly recently"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsSection;