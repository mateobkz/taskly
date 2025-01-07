import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart, 
  Calendar,
  Search,
  Star,
  BookOpen,
  Filter,
  Pencil,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Task {
  id: number;
  title: string;
  date_completed: string;
  skills_acquired: string;
  difficulty: 'Low' | 'Medium' | 'High';
  description: string;
  key_challenges: string;
  key_takeaways: string;
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
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

  const weeklySummary = getWeeklySummary();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, Mateo!</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> This Week
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Search Tasks</h4>
                  <Input 
                    placeholder="Search by title or skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Filter by Difficulty</h4>
                  <div className="flex gap-2">
                    {["Low", "Medium", "High"].map((diff) => (
                      <Button
                        key={diff}
                        variant={selectedDifficulty === diff ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDifficulty(diff === selectedDifficulty ? null : diff)}
                      >
                        {diff}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">Tasks Completed: {weeklySummary.totalTasks}</div>
              <div className="text-sm">Top Skill: {weeklySummary.topSkill}</div>
              <div className="text-sm">Most Challenging: {weeklySummary.challengingTask}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              Recent Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Set(tasks.flatMap(task => 
                task.skills_acquired.split(',').map(skill => skill.trim())
              ))).slice(0, 5).map((skill, index) => (
                <div key={index} className="text-sm">{skill}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Monthly Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">Total Tasks: {tasks.length}</div>
              <div className="text-sm">High Difficulty: {tasks.filter(t => t.difficulty === 'High').length}</div>
              <div className="text-sm">Medium Difficulty: {tasks.filter(t => t.difficulty === 'Medium').length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(task.date_completed).toLocaleDateString()} · {task.difficulty}
                  </p>
                  <p className="text-sm">{task.skills_acquired}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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