import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types/goal";
import { CalendarClock, Edit } from "lucide-react";
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
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CalendarClock className="h-5 w-5 text-blue-600" />
          Weekly Goal
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-white hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
          {currentWeeklyGoal ? 'Edit Goal' : 'Set Goal'}
        </Button>
      </CardHeader>
      <CardContent>
        {currentWeeklyGoal ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {currentWeeklyGoal.title}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>{currentWeeklyGoal.current_value}</span>
                <span>{currentWeeklyGoal.target_value}</span>
              </div>
              <Progress 
                value={calculateProgress(currentWeeklyGoal)} 
                className="h-2.5 bg-blue-100"
              />
            </div>
            <p className="text-sm text-blue-600 font-medium">
              {currentWeeklyGoal.category === 'tasks' 
                ? `${currentWeeklyGoal.target_value - currentWeeklyGoal.current_value} tasks remaining`
                : `${Math.round((currentWeeklyGoal.target_value - currentWeeklyGoal.current_value) * 10) / 10} hours remaining`
              }
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No active weekly goal</p>
            <p className="text-sm text-gray-400 mt-1">Set a goal to track your progress</p>
          </div>
        )}
      </CardContent>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGoalSet={() => {
          window.location.reload();
        }}
        currentGoal={currentWeeklyGoal}
      />
    </Card>
  );
};

export default GoalProgress;