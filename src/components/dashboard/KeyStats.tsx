import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Clock, Award, Flag } from "lucide-react";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface KeyStatsProps {
  tasks: Task[];
}

const KeyStats = ({ tasks }: KeyStatsProps) => {
  const getStats = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyTasks = tasks.filter(task => 
      new Date(task.date_completed) >= oneMonthAgo
    );

    const totalHours = monthlyTasks.reduce((acc, task) => 
      acc + (task.duration_minutes / 60), 0
    );

    const skillCount: { [key: string]: number } = {};
    monthlyTasks.forEach(task => {
      task.skills_acquired.split(',').forEach(skill => {
        const trimmedSkill = skill.trim();
        skillCount[trimmedSkill] = (skillCount[trimmedSkill] || 0) + 1;
      });
    });

    const topSkill = Object.entries(skillCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
    const challengingTask = monthlyTasks.find(task => task.difficulty === "High")?.title || "None";

    return {
      tasksCompleted: monthlyTasks.length,
      totalHours: Math.round(totalHours * 10) / 10,
      topSkill,
      challengingTask
    };
  };

  const stats = getStats();

  const statItems = [
    {
      icon: CheckSquare,
      label: "Tasks Completed",
      value: stats.tasksCompleted,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: Clock,
      label: "Hours Spent",
      value: stats.totalHours,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Award,
      label: "Top Skill",
      value: stats.topSkill,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Flag,
      label: "Most Challenging",
      value: stats.challengingTask,
      color: "text-red-500",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card 
          key={index} 
          className={cn(
            "transition-all duration-200 hover:shadow-md",
            "group hover:scale-[1.02]"
          )}
        >
          <CardContent className="p-6">
            <div className="flex flex-col space-y-3">
              <div className={cn(
                "p-2 rounded-lg w-10 h-10 flex items-center justify-center",
                "transition-colors duration-200",
                item.bgColor,
                "group-hover:bg-opacity-75"
              )}>
                <item.icon className={cn("h-5 w-5", item.color)} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <div className="min-h-[2rem] flex items-center">
                  <p 
                    className={cn(
                      "text-xl font-bold truncate max-w-full",
                      typeof item.value === 'string' && item.value.length > 20 ? "text-lg" : "text-xl"
                    )}
                    title={item.value.toString()}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KeyStats;