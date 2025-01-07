import React, { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie } from "recharts";
import { Task } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface ChartSectionProps {
  tasks: Task[];
}

const ChartSection = ({ tasks }: ChartSectionProps) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const { toast } = useToast();

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

  const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];
  const HOVER_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

  const handleChartClick = (data: any) => {
    if (!data || !data.name) return;
    const filterValue = data.name;
    setSelectedFilter(prevFilter => prevFilter === filterValue ? null : filterValue);
    toast({
      title: "Filter Applied",
      description: `Showing tasks for ${filterValue}`,
    });
  };

  return (
    <Card className="col-span-2 transition-all duration-300 hover:shadow-lg animate-fade-in bg-white/50 backdrop-blur-sm border-2">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">Analytics Dashboard</CardTitle>
        <Tabs defaultValue="difficulty" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger 
              value="difficulty" 
              className="transition-all duration-200 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Task Difficulty
            </TabsTrigger>
            <TabsTrigger 
              value="time" 
              className="transition-all duration-200 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Time Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="skills" 
              className="transition-all duration-200 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Skill Distribution
            </TabsTrigger>
            <TabsTrigger 
              value="completion" 
              className="transition-all duration-200 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Task Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="difficulty" className="h-[300px] mt-6">
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
          </TabsContent>

          <TabsContent value="time" className="h-[300px] mt-6">
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
          </TabsContent>

          <TabsContent value="skills" className="h-[300px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={getSkillsData()}
                onClick={(data) => handleChartClick(data.activePayload?.[0]?.payload)}
              >
                <XAxis 
                  dataKey="name" 
                  stroke="#000000" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  interval={0}
                />
                <YAxis stroke="#000000" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {getSkillsData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={selectedFilter === entry.name ? HOVER_COLORS[index % HOVER_COLORS.length] : COLORS[index % COLORS.length]}
                      className="transition-colors duration-300 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="completion" className="h-[300px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: tasks.length },
                    { name: 'In Progress', value: Math.round(tasks.length * 0.3) },
                    { name: 'Planned', value: Math.round(tasks.length * 0.2) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[0, 1, 2].map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
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
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default ChartSection;