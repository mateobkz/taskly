import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Task } from "@/types/task";

interface MonthlyStatsProps {
  tasks: Task[];
}

const MonthlyStats = ({ tasks }: MonthlyStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="mr-2 h-4 w-4" />
          Monthly Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">Total Tasks: {tasks.length}</div>
          <div className="text-sm">High Difficulty: {tasks.filter(t => t.difficulty === 'High').length}</div>
          <div className="text-sm">Medium Difficulty: {tasks.filter(t => t.difficulty === 'Medium').length}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyStats;