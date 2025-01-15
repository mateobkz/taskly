import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import { Goal } from "@/types/goal";
import { useNavigate } from "react-router-dom";
import FilterSection from "./dashboard/FilterSection";
import GoalProgress from "./dashboard/GoalProgress";
import TaskList from "./dashboard/TaskList";
import InsightsSection from "./dashboard/InsightsSection";
import TimeSpentChart from "./dashboard/charts/TimeSpentChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar, Clock, ListPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TaskForm from "@/components/TaskFormNew";
import { Button } from "./ui/button";

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <GoalProgress goals={goals} />
          
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Tasks
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/tasks')}
                className="text-blue-600 hover:bg-blue-50"
              >
                <ListPlus className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <TaskList 
                tasks={tasks.slice(0, 3)}
                onEdit={(task) => {
                  setSelectedTask(task);
                  setIsEditDialogOpen(true);
                }}
                onDelete={handleDeleteTask}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <InsightsSection tasks={tasks} />
          
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar className="h-5 w-5" />
                Time Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <TimeSpentChart tasks={tasks} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskForm
              initialData={selectedTask}
              isEditing={true}
              onTaskAdded={() => {
                setIsEditDialogOpen(false);
                fetchTasks();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;