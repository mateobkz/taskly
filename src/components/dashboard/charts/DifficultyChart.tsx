import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Task } from "@/types/task";

interface DifficultyChartProps {
  tasks: Task[];
}

const DifficultyChart = ({ tasks }: DifficultyChartProps) => {
  const getDifficultyData = () => {
    const difficultyCount = {
      Low: tasks.filter(t => t.difficulty === 'Low').length,
      Medium: tasks.filter(t => t.difficulty === 'Medium').length,
      High: tasks.filter(t => t.difficulty === 'High').length,
    };

    return [
      { name: 'Low', value: difficultyCount.Low },
      { name: 'Medium', value: difficultyCount.Medium },
      { name: 'High', value: difficultyCount.High },
    ];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={getDifficultyData()}>
        <XAxis dataKey="name" stroke="#000000" />
        <YAxis stroke="#000000" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px'
          }}
        />
        <Bar dataKey="value" className="transition-all duration-300">
          {getDifficultyData().map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.name === 'Low' ? '#22C55E' : entry.name === 'Medium' ? '#EAB308' : '#EF4444'}
              className="transition-colors duration-300 hover:opacity-80 cursor-pointer"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DifficultyChart;