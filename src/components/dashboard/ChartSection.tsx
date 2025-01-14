import React, { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";
import DifficultyChart from "./charts/DifficultyChart";
import TimeSpentChart from "./charts/TimeSpentChart";
import SkillsChart from "./charts/SkillsChart";
import ProgressChart from "./charts/ProgressChart";
import { Info } from "lucide-react";

interface ChartSectionProps {
  tasks: Task[];
}

const ChartSection = ({ tasks }: ChartSectionProps) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const { toast } = useToast();

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
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">Analytics Dashboard</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Click on chart elements to filter tasks</span>
          </div>
        </div>
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

          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
            <TabsContent value="difficulty" className="h-[300px]">
              <DifficultyChart tasks={tasks} />
            </TabsContent>

            <TabsContent value="time" className="h-[300px]">
              <TimeSpentChart tasks={tasks} />
            </TabsContent>

            <TabsContent value="skills" className="h-[300px]">
              <SkillsChart 
                tasks={tasks}
                selectedFilter={selectedFilter}
                onChartClick={handleChartClick}
              />
            </TabsContent>

            <TabsContent value="completion" className="h-[300px]">
              <ProgressChart tasks={tasks} />
            </TabsContent>
          </div>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default ChartSection;