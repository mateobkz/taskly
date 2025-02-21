import React from "react";
import { Task } from "@/types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Clock, CheckCircle, CircleSlash, CirclePlay } from "lucide-react";
import EnhanceTaskButton from "./EnhanceTaskButton";
import { formatDuration } from "@/utils/timeUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskCardProps {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

const getStatusIcon = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'in progress':
      return <CirclePlay className="h-4 w-4" />;
    case 'not started':
    default:
      return <CircleSlash className="h-4 w-4" />;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'not started':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const TaskCard = ({ task, onView, onEdit, onDelete }: TaskCardProps) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="font-medium text-lg line-clamp-1">{task.title}</h3>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge className={getDifficultyColor(task.difficulty)}>
                        {task.difficulty}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Task Difficulty</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{task.status || 'Not Started'}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Task Status</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {task.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {task.skills_acquired.split(',').map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {skill.trim()}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {formatDuration(task.duration_minutes)}
            </div>

            <div className="flex items-center gap-2">
              <EnhanceTaskButton task={task} onTaskUpdated={() => onEdit(task)} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(task)}
                className="text-blue-600 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="text-yellow-600 hover:bg-yellow-50"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;