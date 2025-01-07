import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Task } from "@/types/task"
import { Badge } from "@/components/ui/badge"
import { Calendar, Book, Star, Trophy, AlertTriangle, Lightbulb, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface TaskViewModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TaskSection = ({ icon: Icon, title, content }: { icon: any, title: string, content: string }) => (
  <div className="space-y-2 animate-fade-in">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <h4 className="font-medium">{title}</h4>
    </div>
    <p className="text-sm pl-6 text-gray-700 whitespace-pre-wrap">{content}</p>
    <Separator className="my-4" />
  </div>
)

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

const TaskViewModal = ({ task, open, onOpenChange }: TaskViewModalProps) => {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
          <DialogDescription>
            Detailed information about this task
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(task.date_completed).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatDuration(task.duration_minutes)}
              </span>
              <Badge className={`${getDifficultyColor(task.difficulty)} ml-2`}>
                {task.difficulty}
              </Badge>
            </div>
          </div>

          <TaskSection 
            icon={Book}
            title="Description"
            content={task.description}
          />

          <TaskSection 
            icon={Star}
            title="Skills Acquired"
            content={task.skills_acquired}
          />

          <TaskSection 
            icon={AlertTriangle}
            title="Key Challenges"
            content={task.key_challenges}
          />

          <TaskSection 
            icon={Lightbulb}
            title="Key Takeaways"
            content={task.key_takeaways}
          />

          <div className="flex flex-wrap gap-2 mt-4">
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
      </DialogContent>
    </Dialog>
  );
};

export default TaskViewModal;