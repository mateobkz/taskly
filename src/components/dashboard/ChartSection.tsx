import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie } from "recharts";
import { Task } from "@/types/task";

interface ChartSectionProps {
  tasks: Task[];
}

const ChartSection = ({ tasks }: ChartSectionProps) => {
  const [activeTab, setActiveTab] = useState("difficulty");

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

  const COLORS = ['#22C55E', '#EAB308', '#EF4444'];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="difficulty">Difficulty Distribution</TabsTrigger>
            <TabsTrigger value="time">Time Spent</TabsTrigger>
            <TabsTrigger value="skills">Top Skills</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          <TabsContent value="difficulty" className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDifficultyData()}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {getDifficultyData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="time" className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getTimeSpentData()}>
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
          </TabsContent>

          <TabsContent value="skills" className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getSkillsData()}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartSection;