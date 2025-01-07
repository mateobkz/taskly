import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

interface WeeklySummaryProps {
  totalTasks: number;
  topSkill: string;
  challengingTask: string;
}

const WeeklySummary = ({ totalTasks, topSkill, challengingTask }: WeeklySummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart className="mr-2 h-4 w-4" />
          Weekly Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">Tasks Completed: {totalTasks}</div>
          <div className="text-sm">Top Skill: {topSkill}</div>
          <div className="text-sm">Most Challenging: {challengingTask}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklySummary;