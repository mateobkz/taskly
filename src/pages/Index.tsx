import React from "react";
import Dashboard from "@/components/Dashboard";
import TaskForm from "@/components/TaskForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

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
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="add-task">Add Task</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="dashboard" className="space-y-4">
          <Dashboard />
        </TabsContent>
        
        <TabsContent value="add-task">
          <TaskForm onTaskAdded={handleTaskAdded} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;