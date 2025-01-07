import React from "react"
import { Task } from "@/types/task"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface TaskCardProps {
  task: Task
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'low':
      return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
    case 'medium':
      return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
    case 'high':
      return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
    default:
      return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
  }
};

const TaskCard = ({ task, onView, onEdit, onDelete }: TaskCardProps) => {
  return (
    <div 
      className="p-4 border rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-white/80 backdrop-blur-sm group animate-fade-in"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 group-hover:text-black transition-colors line-clamp-1">
            {task.title}
          </h3>
          <Badge className={`${getDifficultyColor(task.difficulty)} shadow-sm`}>
            {task.difficulty}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600">
          {new Date(task.date_completed).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {task.skills_acquired.split(',').slice(0, 3).map((skill, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="bg-blue-50/50 border-blue-200 text-blue-700 group-hover:bg-blue-100/50 transition-colors"
            >
              {skill.trim()}
            </Badge>
          ))}
          {task.skills_acquired.split(',').length > 3 && (
            <Badge 
              variant="outline" 
              className="bg-gray-50 border-gray-200 text-gray-600"
            >
              +{task.skills_acquired.split(',').length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onView(task)}
            className="transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(task)}
            className="transition-all duration-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this task? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(task.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

export default TaskCard