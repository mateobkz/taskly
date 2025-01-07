import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Clock, Award, Flag } from "lucide-react";
import { Task } from "@/types/task";

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
      color: "text-green-500"
    },
    {
      icon: Clock,
      label: "Hours Spent",
      value: stats.totalHours,
      color: "text-blue-500"
    },
    {
      icon: Award,
      label: "Top Skill",
      value: stats.topSkill,
      color: "text-yellow-500"
    },
    {
      icon: Flag,
      label: "Most Challenging",
      value: stats.challengingTask,
      color: "text-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card key={index} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <div className={`${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-xl font-bold truncate" title={item.value.toString()}>
                  {item.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KeyStats;