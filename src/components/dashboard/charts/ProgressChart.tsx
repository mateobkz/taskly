import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Task } from "@/types/task";

interface ProgressChartProps {
  tasks: Task[];
}

const ProgressChart = ({ tasks }: ProgressChartProps) => {
  const getProgressData = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.date_completed).length;
    const inProgressTasks = Math.round(totalTasks * 0.3);
    const plannedTasks = Math.round(totalTasks * 0.2);

    return [
      { name: 'Completed', value: completedTasks, color: '#3B82F6' },
      { name: 'In Progress', value: inProgressTasks, color: '#60A5FA' },
      { name: 'Planned', value: plannedTasks, color: '#93C5FD' }
    ];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={getProgressData()}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {getProgressData().map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={entry.color}
              className="transition-opacity duration-300 hover:opacity-80"
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px'
          }}
          formatter={(value: any) => [`${value} Tasks`, '']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;