import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types/goal";
import { CalendarClock } from "lucide-react";

interface GoalProgressProps {
  goals: Goal[];
}

const GoalProgress = ({ goals }: GoalProgressProps) => {
  const currentWeeklyGoal = goals.find(goal => 
    goal.period === 'Weekly' && 
    new Date(goal.end_date) >= new Date()
  );

  const calculateProgress = (goal: Goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  return (
    <Card className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Weekly Goal Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentWeeklyGoal ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{currentWeeklyGoal.title}</h3>
              <span className="text-sm text-muted-foreground">
                {currentWeeklyGoal.current_value} / {currentWeeklyGoal.target_value}
              </span>
            </div>
            <Progress value={calculateProgress(currentWeeklyGoal)} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Category: {currentWeeklyGoal.category}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active weekly goals</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalProgress;