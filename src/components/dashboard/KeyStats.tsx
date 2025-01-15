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
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
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
      color: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    {
      icon: Flag,
      label: "Most Challenging",
      value: stats.challengingTask,
      color: "text-rose-500",
      bgColor: "bg-rose-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {statItems.map((item, index) => (
        <Card 
          key={index} 
          className={cn(
            "transition-all duration-200 hover:shadow-md",
            "group hover:scale-[1.02]"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className={cn(
                "p-2 rounded-lg w-8 h-8 flex items-center justify-center",
                "transition-colors duration-200",
                item.bgColor,
                "group-hover:bg-opacity-75"
              )}>
                <item.icon className={cn("h-4 w-4", item.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground mb-0.5">
                  {item.label}
                </p>
                <div className="flex items-center">
                  <p 
                    className={cn(
                      "font-semibold truncate",
                      typeof item.value === 'string' && item.value.length > 20 
                        ? "text-sm" 
                        : "text-lg"
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