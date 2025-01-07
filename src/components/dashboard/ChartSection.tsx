import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie } from "recharts";
import { Task } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface ChartSectionProps {
  tasks: Task[];
}

const ChartSection = ({ tasks }: ChartSectionProps) => {
  const [activeTab, setActiveTab] = useState("difficulty");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const { toast } = useToast();

  const getDifficultyData = () => {
    console.log("Calculating difficulty data from tasks:", tasks);
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
    console.log("Calculating time spent data");
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
    console.log("Calculating skills data");
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

  const handleChartClick = (data: any) => {
    if (!data || !data.name) return;
    
    const filterValue = data.name;
    setSelectedFilter(prevFilter => prevFilter === filterValue ? null : filterValue);
    
    toast({
      title: "Filter Applied",
      description: `Showing tasks for ${filterValue}`,
    });
  };

  const COLORS = {
    Low: '#22C55E',
    Medium: '#EAB308',
    High: '#EF4444'
  };

  const HOVER_COLORS = {
    Low: '#16A34A',
    Medium: '#CA8A04',
    High: '#DC2626'
  };

  return (
    <Card className="col-span-2 transition-all duration-300 hover:shadow-lg animate-fade-in bg-white/50 backdrop-blur-sm border-2">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Analytics</CardTitle>
        <Tabs defaultValue="difficulty" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger 
              value="difficulty" 
              className="transition-all duration-200 data-[state=active]:bg-blue-400 data-[state=active]:text-white"
            >
              Difficulty Distribution
            </TabsTrigger>
            <TabsTrigger 
              value="time" 
              className="transition-all duration-200 data-[state=active]:bg-blue-400 data-[state=active]:text-white"
            >
              Time Spent
            </TabsTrigger>
            <TabsTrigger 
              value="skills" 
              className="transition-all duration-200 data-[state=active]:bg-blue-400 data-[state=active]:text-white"
            >
              Top Skills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="difficulty" className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={getDifficultyData()} 
                onClick={(data) => handleChartClick(data.activePayload?.[0]?.payload)}
              >
                <XAxis dataKey="name" stroke="#000000" />
                <YAxis stroke="#000000" />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.1)' }}
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
                      fill={selectedFilter === entry.name ? HOVER_COLORS[entry.name as keyof typeof HOVER_COLORS] : COLORS[entry.name as keyof typeof COLORS]}
                      className="transition-colors duration-300 hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="time" className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getTimeSpentData()}>
                <XAxis dataKey="date" stroke="#000000" />
                <YAxis stroke="#000000" />
                <Tooltip 
                  cursor={{ stroke: '#94A3B8' }}
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

          <TabsContent value="skills" className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={getSkillsData()}
                onClick={(data) => handleChartClick(data.activePayload?.[0]?.payload)}
              >
                <XAxis dataKey="name" stroke="#000000" angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#000000" />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3B82F6"
                  className="transition-all duration-300 hover:opacity-80"
                >
                  {getSkillsData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={selectedFilter === entry.name ? '#2563EB' : '#3B82F6'}
                      className="transition-colors duration-300 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default ChartSection;