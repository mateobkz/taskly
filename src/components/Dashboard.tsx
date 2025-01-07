import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TaskForm from "@/components/TaskForm";
import WeeklySummary from "./dashboard/WeeklySummary";
import RecentSkills from "./dashboard/RecentSkills";
import MonthlyStats from "./dashboard/MonthlyStats";
import TaskList from "./dashboard/TaskList";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Low' | 'Medium' | 'High' | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const fetchTasks = async () => {
    console.log("Fetching tasks");
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('date_completed', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,skills_acquired.ilike.%${searchQuery}%`);
      }

      if (selectedDifficulty) {
        query = query.eq('difficulty', selectedDifficulty);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTasks();
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

  const getWeeklySummary = () => {
    console.log("Calculating weekly summary");
    if (!tasks.length) return { totalTasks: 0, topSkill: "None", challengingTask: "None" };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyTasks = tasks.filter(task => 
      new Date(task.date_completed) >= oneWeekAgo
    );

    const skillCount: { [key: string]: number } = {};
    weeklyTasks.forEach(task => {
      task.skills_acquired.split(',').forEach(skill => {
        const trimmedSkill = skill.trim();
        skillCount[trimmedSkill] = (skillCount[trimmedSkill] || 0) + 1;
      });
    });

    const topSkill = Object.entries(skillCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
    const challengingTask = weeklyTasks.find(task => task.difficulty === "High")?.title || "None";

    return {
      totalTasks: weeklyTasks.length,
      topSkill,
      challengingTask
    };
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, Mateo!</h1>
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
            <PopoverContent className="w-80 bg-background border shadow-lg">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Search Tasks</h4>
                  <Input 
                    placeholder="Search by title or skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Filter by Difficulty</h4>
                  <div className="flex gap-2">
                    {["Low", "Medium", "High"].map((diff) => (
                      <Badge
                        key={diff}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedDifficulty === diff 
                            ? getDifficultyColor(diff)
                            : 'bg-muted hover:bg-accent/20'
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WeeklySummary {...getWeeklySummary()} />
        <RecentSkills skills={Array.from(new Set(tasks.flatMap(task => 
          task.skills_acquired.split(',').map(skill => skill.trim())
        )))} />
        <MonthlyStats tasks={tasks} />
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
        <DialogContent className="max-w-2xl">
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