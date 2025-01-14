import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Task } from "@/types/task";

interface ProgressChartProps {
  tasks: Task[];
}

const ProgressChart = ({ tasks }: ProgressChartProps) => {
  const COLORS = {
    Completed: '#3B82F6',
    'In Progress': '#60A5FA',
    Planned: '#93C5FD'
  };

  const getProgressData = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.date_completed).length;
    const inProgressTasks = Math.round(totalTasks * 0.3);
    const plannedTasks = Math.round(totalTasks * 0.2);

    return [
      { name: 'Completed', value: completedTasks, color: COLORS.Completed },
      { name: 'In Progress', value: inProgressTasks, color: COLORS['In Progress'] },
      { name: 'Planned', value: plannedTasks, color: COLORS.Planned }
    ];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-blue-600">{`${payload[0].value} Tasks`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative h-full">
      <div className="absolute top-0 left-0 w-full text-center text-sm text-gray-500">
        Task Completion Status
      </div>
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
            className="transition-all duration-300"
          >
            {getProgressData().map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-opacity duration-300 hover:opacity-80 cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value: string) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;