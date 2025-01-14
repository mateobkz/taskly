import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Task } from "@/types/task";

interface SkillsChartProps {
  tasks: Task[];
  selectedFilter: string | null;
  onChartClick: (data: any) => void;
}

const SkillsChart = ({ tasks, selectedFilter, onChartClick }: SkillsChartProps) => {
  const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];
  const HOVER_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

  const getSkillsData = () => {
    const skillCount: { [key: string]: number } = {};
    tasks.forEach(task => {
      task.skills_acquired.split(',').forEach(skill => {
        const trimmedSkill = skill.trim();
        skillCount[trimmedSkill] = (skillCount[trimmedSkill] || 0) + 1;
      });
    });

    return Object.entries(skillCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">{`${payload[0].value} Tasks`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={getSkillsData()}
        onClick={(data) => onChartClick(data.activePayload?.[0]?.payload)}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <XAxis 
          dataKey="name" 
          stroke="#000000" 
          angle={-45} 
          textAnchor="end" 
          height={60}
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#000000"
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          radius={[4, 4, 0, 0]}
          className="transition-all duration-300"
        >
          {getSkillsData().map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={selectedFilter === entry.name ? HOVER_COLORS[index % HOVER_COLORS.length] : COLORS[index % COLORS.length]}
              className="transition-colors duration-300 cursor-pointer hover:opacity-80"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SkillsChart;