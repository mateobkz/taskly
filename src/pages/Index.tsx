import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardProvider } from "@/contexts/DashboardContext";
import Header from "@/components/layout/Header";
import MainTabs from "@/components/layout/MainTabs";
import AuthStateHandler from "@/components/layout/AuthStateHandler";
import QuickAddTask from "@/components/task/QuickAddTask";
import FeedbackButton from "@/components/feedback/FeedbackButton";
import OnboardingDialog from "@/components/dashboard/OnboardingDialog";

const IndexContent = () => {
  const { toast } = useToast();
  const { dashboards, isLoading } = useDashboard();

  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found in tasks query");
          return [];
        }

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('date_completed', { ascending: false });

        if (error) {
          console.error("Error fetching tasks:", error);
          throw error;
        }

        return data?.map(task => ({
          ...task,
          priority: task.priority as Task['priority'],
          status: task.status as Task['status']
        })) as Task[];
      } catch (error) {
        console.error("Error in tasks query:", error);
        toast({
          title: "Error",
          description: "Failed to fetch tasks. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const handleTaskAdded = () => {
    refetchTasks();
    toast({
      title: "Task Added",
      description: "Your task has been successfully recorded.",
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {!isLoading && dashboards.length === 0 && <OnboardingDialog />}
      <div className="container py-20">
        <MainTabs 
          tasks={tasks}
          onTaskAdded={handleTaskAdded}
          refetchTasks={refetchTasks}
        />
        <QuickAddTask onTaskAdded={handleTaskAdded} />
        <FeedbackButton />
      </div>
    </>
  );
};

const Index = () => {
  return (
    <DashboardProvider>
      <Header />
      <AuthStateHandler />
      <IndexContent />
    </DashboardProvider>
  );
};

export default Index;