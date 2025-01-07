import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock } from "lucide-react";
import { Task } from "@/types/task";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";

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
    { name: 'Low', value: difficultyCount.Low },
    { name: 'Medium', value: difficultyCount.Medium },
    { name: 'High', value: difficultyCount.High },
  ];

  // Calculate hours spent per day for the last 7 days
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const hoursData = last7Days.map(date => {
    const dayTasks = tasks.filter(task => task.date_completed === date);
    const totalMinutes = dayTasks.reduce((acc, task) => acc + task.duration_minutes, 0);
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      hours: Number((totalMinutes / 60).toFixed(1))
    };
  });

  return (
    <Card className="bg-blue-50/50 transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="mr-2 h-4 w-4" />
          Monthly Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.name === 'Low' ? '#22C55E' : 
                      entry.name === 'Medium' ? '#EAB308' : 
                      '#EF4444'
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[200px] w-full mb-4">
          <div className="flex items-center mb-2">
            <Clock className="mr-2 h-4 w-4" />
            <h3 className="text-sm font-medium">Hours Spent (Last 7 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hoursData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
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