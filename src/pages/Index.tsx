import React from "react";
import Dashboard from "@/components/Dashboard";
import TaskForm from "@/components/TaskFormNew";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import QuickAddTask from "@/components/task/QuickAddTask";

const Index = () => {
  const { toast } = useToast();

  const handleTaskAdded = () => {
    toast({
      title: "Task Added",
      description: "Your task has been successfully recorded.",
    });
  };

  return (
    <div className="container py-8">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <TabsList className="bg-white/50 backdrop-blur-sm">
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="add-task"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Add Task
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="dashboard" className="space-y-4">
          <Dashboard />
        </TabsContent>
        
        <TabsContent value="add-task">
          <TaskForm onTaskAdded={handleTaskAdded} />
        </TabsContent>
      </Tabs>
      
      <QuickAddTask onTaskAdded={handleTaskAdded} />
    </div>
  );
};

export default Index;