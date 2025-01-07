import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { Task } from "@/types/task";

interface HeroSectionProps {
  tasks: Task[];
}

const HeroSection = ({ tasks }: HeroSectionProps) => {
  const calculateWeeklyProgress = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyTasks = tasks.filter(task => 
      new Date(task.date_completed) >= oneWeekAgo
    );
    
    // Assuming a goal of 10 tasks per week
    const progress = Math.min((weeklyTasks.length / 10) * 100, 100);
    return Math.round(progress);
  };

  const progress = calculateWeeklyProgress();

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-primary">
                  Welcome, Mateo! Keep up the great work!
                </h1>
                <img 
                  src="/lovable-uploads/8705599b-73a8-4967-8c21-fd6f78dd12dd.png" 
                  alt="Amazon Logo" 
                  className="h-8 object-contain"
                />
              </div>
              <p className="text-muted-foreground">
                Track your learning journey and celebrate your progress
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">
                  {tasks.length} tasks completed this month
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Weekly Goal Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroSection;