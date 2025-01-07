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
    <Card className="bg-green-50/50 transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart className="mr-2 h-4 w-4" />
          Weekly Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm flex justify-between">
            <span className="font-semibold text-gray-600">Tasks Completed:</span>
            <span className="font-medium">{totalTasks}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="font-semibold text-gray-600">Top Skill:</span>
            <span className="font-medium">{topSkill}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="font-semibold text-gray-600">Most Challenging:</span>
            <span className="font-medium">{challengingTask}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklySummary;