import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Filter, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TaskForm from "@/components/TaskFormNew";
import TaskList from "./dashboard/TaskList";
import { Task } from "@/types/task";
import { Goal } from "@/types/goal";
import { Badge } from "@/components/ui/badge";
import HeroSection from "./dashboard/HeroSection";
import KeyStats from "./dashboard/KeyStats";
import InsightsSection from "./dashboard/InsightsSection";
import ChartSection from "./dashboard/ChartSection";
import GoalProgress from "./dashboard/GoalProgress";
import { useNavigate } from "react-router-dom";

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
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" className="transition-all duration-200 hover:bg-accent hover:text-accent-foreground">
            <Calendar className="mr-2 h-4 w-4" /> This Week
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white border shadow-lg">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-black">Search Tasks</h4>
                  <Input 
                    placeholder="Search by title or skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-black">Filter by Difficulty</h4>
                  <div className="flex gap-2">
                    {["Low", "Medium", "High"].map((diff) => (
                      <Badge
                        key={diff}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedDifficulty === diff 
                            ? 'bg-accent text-black font-medium'
                            : 'bg-muted text-black hover:bg-accent/20'
                        }`}
                        onClick={() => setSelectedDifficulty(
                          diff === selectedDifficulty ? null : diff as 'Low' | 'Medium' | 'High'
                        )}
                      >
                        {diff}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>

      <HeroSection tasks={tasks} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KeyStats tasks={tasks} />
        <GoalProgress goals={goals} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightsSection tasks={tasks} />
        <ChartSection tasks={tasks} />
      </div>

      <TaskList 
        tasks={tasks}
        onEdit={(task) => {
          setSelectedTask(task);
          setIsEditDialogOpen(true);
        }}
        onDelete={handleDeleteTask}
      />

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