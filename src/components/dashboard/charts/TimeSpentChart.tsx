import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Task } from "@/types/task";

interface TimeSpentChartProps {
  tasks: Task[];
}

const TimeSpentChart = ({ tasks }: TimeSpentChartProps) => {
  const getTimeSpentData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTasks = tasks.filter(task => task.date_completed === date);
      const totalHours = dayTasks.reduce((acc, task) => acc + (task.duration_minutes / 60), 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Number(totalHours.toFixed(1))
      };
    });
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={getTimeSpentData()}>
        <XAxis dataKey="date" stroke="#000000" />
        <YAxis stroke="#000000" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="hours" 
          stroke="#3B82F6" 
          strokeWidth={2}
          dot={{ 
            fill: '#3B82F6',
            r: 4,
            strokeWidth: 2
          }}
          activeDot={{ 
            r: 6,
            className: "animate-pulse"
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TimeSpentChart;