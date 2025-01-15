import React, { useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import TaskForm from "@/components/TaskFormNew";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import QuickAddTask from "@/components/task/QuickAddTask";
import Header from "@/components/layout/Header";
import CalendarView from "@/components/calendar/CalendarView";
import FeedbackButton from "@/components/feedback/FeedbackButton";
import Profile from "./Profile";
import Tasks from "./Tasks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const OnboardingDialog = () => {
  const { createDashboard } = useDashboard();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const { toast } = useToast();

  const handleCreateDashboard = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a dashboard name",
        variant: "destructive",
      });
      return;
    }

    await createDashboard({
      name,
      company_name: companyName,
      position,
    });

    toast({
      title: "Success",
      description: "Welcome! Your first dashboard has been created.",
    });
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Your Learning Journey!</DialogTitle>
          <DialogDescription>
            Let's start by creating your first dashboard to track your learning progress.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Dashboard Name*</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Learning Journey"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company Name (Optional)</Label>
            <Input
              id="company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="position">Position (Optional)</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Your Role"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCreateDashboard}>Create Dashboard</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const IndexContent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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

  // Check auth state on mount and handle session errors
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Checking auth session:", session);
      
      if (error) {
        console.error("Auth session error:", error);
        toast({
          title: "Session Error",
          description: "Please sign in again",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      if (!session) {
        console.log("No active session, redirecting to auth");
        navigate("/auth");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      }

      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.log("User signed out or deleted, redirecting to auth");
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {!isLoading && dashboards.length === 0 && <OnboardingDialog />}
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
                value="tasks"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Tasks
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

          <TabsContent value="tasks" className="space-y-4">
            <Tasks />
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

const Index = () => {
  return (
    <DashboardProvider>
      <Header />
      <IndexContent />
    </DashboardProvider>
  );
};

export default Index;