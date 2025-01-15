import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types/goal";
import { CalendarClock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoalModal from "../goals/GoalModal";

interface GoalProgressProps {
  goals: Goal[];
}

const GoalProgress = ({ goals }: GoalProgressProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const currentWeeklyGoal = goals.find(goal => 
    goal.period === 'Weekly' && 
    new Date(goal.end_date) >= new Date()
  );

  const calculateProgress = (goal: Goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  return (
    <Card className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Weekly Goal Progress
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          {currentWeeklyGoal ? 'Edit Goal' : 'Set Goal'}
        </Button>
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

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGoalSet={() => {
          // This will trigger a refetch of goals in the parent component
          window.location.reload();
        }}
        currentGoal={currentWeeklyGoal}
      />
    </Card>
  );
};

export default GoalProgress;