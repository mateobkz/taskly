import React from "react";
import Dashboard from "@/components/Dashboard";
import TaskForm from "@/components/TaskFormNew";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import QuickAddTask from "@/components/task/QuickAddTask";
import Header from "@/components/layout/Header";
import CalendarView from "@/components/calendar/CalendarView";
import FeedbackButton from "@/components/feedback/FeedbackButton";
import Profile from "./Profile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { toast } = useToast();

  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('date_completed', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleTaskAdded = () => {
    refetchTasks();
    toast({
      title: "Task Added",
      description: "Your task has been successfully recorded.",
    });
  };

  return (
    <>
      <Header />
      <div className="container py-20">
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
                value="calendar"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Calendar
              </TabsTrigger>
              <TabsTrigger 
                value="add-task"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Add Task
              </TabsTrigger>
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Profile
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="space-y-4">
            <Dashboard />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <CalendarView tasks={tasks} onTaskUpdate={refetchTasks} />
          </TabsContent>
          
          <TabsContent value="add-task">
            <TaskForm onTaskAdded={handleTaskAdded} />
          </TabsContent>

          <TabsContent value="profile">
            <Profile />
          </TabsContent>
        </Tabs>
        
        <QuickAddTask onTaskAdded={handleTaskAdded} />
        <FeedbackButton />
      </div>
    </>
  );
};

export default Index;