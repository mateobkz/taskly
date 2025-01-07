import React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ModalCard } from "@/components/ui/modal-card"
import { Task } from "@/types/task"
import { Badge } from "@/components/ui/badge"
import { Calendar, Book, Star, Trophy, AlertTriangle, Lightbulb } from "lucide-react"
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
    <p className="text-sm pl-6">{content}</p>
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

const TaskViewModal = ({ task, open, onOpenChange }: TaskViewModalProps) => {
  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <ModalCard 
          title={task.title}
          onClose={() => onOpenChange(false)}
          className="border-none"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(task.date_completed).toLocaleDateString()}
              </div>
              <Badge className={getDifficultyColor(task.difficulty)}>
                {task.difficulty}
              </Badge>
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
        </ModalCard>
      </DialogContent>
    </Dialog>
  )
}

export default TaskViewModal