import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Task } from "@/types/task";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'low':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'high':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const TaskSection = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-medium text-muted-foreground">
        {icon}
        <h4>{title}</h4>
      </div>
      <p className="text-sm pl-6">{content}</p>
      <Separator className="my-4" />
    </div>
  );

  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:border-accent hover:shadow-sm hover:bg-accent/5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge className={getDifficultyColor(task.difficulty)}>
                      {task.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(task.date_completed).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {task.skills_acquired.split(',').map((skill, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="bg-background hover:bg-accent/10"
                      >
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedTask(task)}
                    className="transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(task)}
                    className="transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(task.id)}
                    className="transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedTask?.title}</span>
              {selectedTask && (
                <Badge className={getDifficultyColor(selectedTask.difficulty)}>
                  {selectedTask.difficulty}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <TaskSection 
                icon={<Eye className="h-4 w-4" />}
                title="Description"
                content={selectedTask.description}
              />
              <TaskSection 
                icon={<Eye className="h-4 w-4" />}
                title="Skills Acquired"
                content={selectedTask.skills_acquired}
              />
              <TaskSection 
                icon={<Eye className="h-4 w-4" />}
                title="Key Challenges"
                content={selectedTask.key_challenges}
              />
              <TaskSection 
                icon={<Eye className="h-4 w-4" />}
                title="Key Takeaways"
                content={selectedTask.key_takeaways}
              />
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Completed on: {new Date(selectedTask.date_completed).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskList;