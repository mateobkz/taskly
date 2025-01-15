import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { Goal } from "@/types/goal";
import HeroSection from "./dashboard/HeroSection";
import KeyStats from "./dashboard/KeyStats";
import InsightsSection from "./dashboard/InsightsSection";
import ChartSection from "./dashboard/ChartSection";
import GoalProgress from "./dashboard/GoalProgress";
import { useNavigate } from "react-router-dom";
import FilterSection from "./dashboard/FilterSection";
import TaskSection from "./dashboard/TaskSection";

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Low' | 'Medium' | 'High' | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  const fetchTasks = async () => {
    console.log("Fetching tasks");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('date_completed', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,skills_acquired.ilike.%${searchQuery}%`);
      }

      if (selectedDifficulty) {
        query = query.eq('difficulty', selectedDifficulty);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type assertion and validation for tasks
      const typedTasks = data?.map(task => ({
        ...task,
        priority: task.priority as Task['priority'],
        status: task.status as Task['status']
      })) as Task[];
      
      setTasks(typedTasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    }
  };

  const fetchGoals = async () => {
    console.log("Fetching goals");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Type assertion and validation for goals
      const typedGoals = data?.map(goal => ({
        ...goal,
        period: goal.period as Goal['period']
      })) as Goal[];

      setGoals(typedGoals || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch goals",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchGoals();
  }, [searchQuery, selectedDifficulty]);

  const handleDeleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <FilterSection 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        handleLogout={handleLogout}
      />

      <HeroSection tasks={tasks} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KeyStats tasks={tasks} />
        <GoalProgress goals={goals} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightsSection tasks={tasks} />
        <ChartSection tasks={tasks} />
      </div>

      <TaskSection 
        tasks={tasks}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        handleDeleteTask={handleDeleteTask}
        fetchTasks={fetchTasks}
      />
    </div>
  );
};

export default Dashboard;