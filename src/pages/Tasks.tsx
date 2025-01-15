import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";
import TaskCard from "@/components/task/TaskCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, ListPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TaskForm from "@/components/TaskFormNew";
import { useToast } from "@/components/ui/use-toast";

const Tasks = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<"Low" | "Medium" | "High" | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const { toast } = useToast();

  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['tasks', searchQuery, selectedDifficulty, selectedStatus],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,skills_acquired.ilike.%${searchQuery}%`);
      }

      if (selectedDifficulty) {
        query = query.eq('difficulty', selectedDifficulty as Task['difficulty']);
      }

      if (selectedStatus) {
        query = query.eq('status', selectedStatus as Task['status']);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }

      return (data || []).map(task => ({
        ...task,
        priority: task.priority || 'Medium',
        status: task.status || 'Not Started'
      })) as Task[];
    },
  });

  const handleTaskDelete = async (taskId: number) => {
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
      refetchTasks();
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
    <div className="container py-20">
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">All Tasks</CardTitle>
          <Button onClick={() => setIsAddTaskOpen(true)}>
            <ListPlus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select
                value={selectedDifficulty || undefined}
                onValueChange={(value) => setSelectedDifficulty(value as "Low" | "Medium" | "High" | null)}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedStatus || undefined}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onView={() => {}}
                  onEdit={(task) => {
                    setSelectedTask(task);
                    setIsAddTaskOpen(true);
                  }}
                  onDelete={handleTaskDelete}
                />
              ))
            ) : (
              <div className="col-span-full">
                <p className="text-center text-gray-500 py-8">No tasks found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          <TaskForm
            initialData={selectedTask}
            isEditing={!!selectedTask}
            onTaskAdded={() => {
              setIsAddTaskOpen(false);
              setSelectedTask(null);
              refetchTasks();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
