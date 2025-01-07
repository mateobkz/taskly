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

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Low':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'High':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

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
                className="flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:border-accent hover:shadow-sm"
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
                  <p className="text-sm">{task.skills_acquired}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedTask(task)}
                    className="transition-all duration-200 hover:bg-accent"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(task)}
                    className="transition-all duration-200 hover:bg-accent"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(task.id)}
                    className="transition-all duration-200 hover:bg-accent"
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
        <DialogContent className="max-w-2xl">
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
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Skills Acquired</h4>
                <p className="text-sm text-muted-foreground">{selectedTask.skills_acquired}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Key Challenges</h4>
                <p className="text-sm text-muted-foreground">{selectedTask.key_challenges}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Key Takeaways</h4>
                <p className="text-sm text-muted-foreground">{selectedTask.key_takeaways}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Completed On</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedTask.date_completed).toLocaleDateString()}
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