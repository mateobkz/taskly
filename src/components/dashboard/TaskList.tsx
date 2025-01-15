import React from "react";
import { Task } from "@/types/task";
import TaskCard from "../task/TaskCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ListPlus } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={() => {}}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No tasks found</p>
        )}
      </div>
      
      <div className="flex justify-center pt-2">
        <Button
          variant="outline"
          onClick={() => navigate('/tasks')}
          className="w-full bg-white hover:bg-gray-50"
        >
          <ListPlus className="h-4 w-4 mr-2" />
          View All Tasks
        </Button>
      </div>
    </div>
  );
};

export default TaskList;