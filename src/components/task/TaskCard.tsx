import React from "react"
import { Task } from "@/types/task"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash2 } from "lucide-react"

interface TaskCardProps {
  task: Task
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
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

const TaskCard = ({ task, onView, onEdit, onDelete }: TaskCardProps) => {
  return (
    <div 
      className="p-4 border rounded-lg transition-all duration-200 hover:border-accent hover:shadow-sm hover:bg-accent/5 group animate-fade-in"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium group-hover:text-accent-foreground transition-colors">
            {task.title}
          </h3>
          <Badge className={getDifficultyColor(task.difficulty)}>
            {task.difficulty}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {new Date(task.date_completed).toLocaleDateString()}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {task.skills_acquired.split(',').slice(0, 3).map((skill, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="bg-background group-hover:bg-accent/10 transition-colors"
            >
              {skill.trim()}
            </Badge>
          ))}
          {task.skills_acquired.split(',').length > 3 && (
            <Badge variant="outline" className="bg-background">
              +{task.skills_acquired.split(',').length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onView(task)}
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
    </div>
  )
}

export default TaskCard