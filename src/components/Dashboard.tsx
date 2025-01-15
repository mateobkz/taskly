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
      
      const typedTasks = data?.map(task => ({
        ...task,
        priority: task.priority as Task['priority'],
        status: task.status as Task['status']
      })) as Task[];
      
      setTasks(typedTasks || []);
      
      // Update goal progress when tasks are fetched
      updateGoalProgress(typedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    }
  };

  const updateGoalProgress = async (currentTasks: Task[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: currentGoals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', 'Weekly');

      if (goalsError) throw goalsError;

      for (const goal of currentGoals || []) {
        if (new Date(goal.end_date) >= new Date()) {
          let currentValue = 0;
          
          switch (goal.category) {
            case 'tasks':
              currentValue = currentTasks.filter(task => 
                new Date(task.date_completed) >= new Date(goal.start_date) &&
                new Date(task.date_completed) <= new Date(goal.end_date)
              ).length;
              break;
            case 'hours':
              currentValue = Math.floor(currentTasks.reduce((acc, task) => 
                acc + (new Date(task.date_completed) >= new Date(goal.start_date) &&
                      new Date(task.date_completed) <= new Date(goal.end_date) ? 
                      task.duration_minutes : 0), 0) / 60);
              break;
            case 'skills':
              const uniqueSkills = new Set(
                currentTasks
                  .filter(task => 
                    new Date(task.date_completed) >= new Date(goal.start_date) &&
                    new Date(task.date_completed) <= new Date(goal.end_date)
                  )
                  .flatMap(task => task.skills_acquired.split(',').map(s => s.trim()))
              );
              currentValue = uniqueSkills.size;
              break;
          }

          if (currentValue !== goal.current_value) {
            const { error: updateError } = await supabase
              .from('goals')
              .update({ 
                current_value: currentValue,
                last_updated: new Date().toISOString()
              })
              .eq('id', goal.id);

            if (updateError) throw updateError;
          }
        }
      }
    } catch (error) {
      console.error("Error updating goal progress:", error);
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

    // Set up real-time subscription for tasks
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          console.log('Tasks changed, refreshing...');
          fetchTasks();
        }
      )
      .subscribe();

    // Set up real-time subscription for goals
    const goalsChannel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        () => {
          console.log('Goals changed, refreshing...');
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(goalsChannel);
    };
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