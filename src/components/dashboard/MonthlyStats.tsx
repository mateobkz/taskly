import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Task } from "@/types/task";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface MonthlyStatsProps {
  tasks: Task[];
}

const MonthlyStats = ({ tasks }: MonthlyStatsProps) => {
  const difficultyCount = {
    Low: tasks.filter(t => t.difficulty === 'Low').length,
    Medium: tasks.filter(t => t.difficulty === 'Medium').length,
    High: tasks.filter(t => t.difficulty === 'High').length,
  };

  const chartData = [
    { name: 'Low', value: difficultyCount.Low, color: '#22C55E' },
    { name: 'Medium', value: difficultyCount.Medium, color: '#EAB308' },
    { name: 'High', value: difficultyCount.High, color: '#EF4444' },
  ];

  return (
    <Card className="bg-blue-50/50 transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="mr-2 h-4 w-4" />
          Monthly Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Bar
                    key={`cell-${index}`}
                    dataKey="value"
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-4">
          <div className="text-sm flex justify-between">
            <span>Total Tasks:</span>
            <span className="font-medium">{tasks.length}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
              High Difficulty:
            </span>
            <span className="font-medium">{difficultyCount.High}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
              Medium Difficulty:
            </span>
            <span className="font-medium">{difficultyCount.Medium}</span>
          </div>
          <div className="text-sm flex justify-between">
            <span className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              Low Difficulty:
            </span>
            <span className="font-medium">{difficultyCount.Low}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyStats;