import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { Task } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";

interface HeroSectionProps {
  tasks: Task[];
}

const HeroSection = ({ tasks }: HeroSectionProps) => {
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    };
    getUserEmail();
  }, []);

  const calculateWeeklyProgress = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyTasks = tasks.filter(task => 
      new Date(task.date_completed) >= oneWeekAgo
    );
    
    const progress = Math.min((weeklyTasks.length / 10) * 100, 100);
    return Math.round(progress);
  };

  const progress = calculateWeeklyProgress();

  const getFirstName = (email: string) => {
    if (email === "aysel.martinez@alumni.esade.edu") {
      return "Aysel";
    }
    return "Mateo";
  };

  const getCompanyLogo = (email: string) => {
    if (email === "aysel.martinez@alumni.esade.edu") {
      return "/lovable-uploads/9ffe8aca-7316-4ca9-8874-f1666475daf5.png";
    }
    return "/lovable-uploads/8705599b-73a8-4967-8c21-fd6f78dd12dd.png";
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary">
                  Welcome, {getFirstName(userEmail)}! Keep up the great work!
                </h1>
                <img 
                  src={getCompanyLogo(userEmail)} 
                  alt="Company Logo" 
                  className="h-8 object-contain ml-8"
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