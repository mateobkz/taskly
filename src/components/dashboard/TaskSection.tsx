import React from "react";
import { Task } from "@/types/task";
import TaskList from "./TaskList";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "@/components/TaskFormNew";

interface TaskSectionProps {
  tasks: Task[];
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  handleDeleteTask: (taskId: number) => void;
  fetchTasks: () => void;
}

const TaskSection = ({
  tasks,
  isEditDialogOpen,
  setIsEditDialogOpen,
  selectedTask,
  setSelectedTask,
  handleDeleteTask,
  fetchTasks,
}: TaskSectionProps) => {
  return (
    <>
      <TaskList 
        tasks={tasks}
        onEdit={(task) => {
          setSelectedTask(task);
          setIsEditDialogOpen(true);
        }}
        onDelete={handleDeleteTask}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
    </>
  );
};

export default TaskSection;