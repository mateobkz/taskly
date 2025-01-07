import React from "react";
import { Button } from "@/components/ui/button";

interface TaskFormFooterProps {
  isEditing: boolean;
  onCancel?: () => void;
}

const TaskFormFooter = ({ isEditing, onCancel }: TaskFormFooterProps) => (
  <div className="flex justify-end gap-4 pt-4">
    {isEditing && (
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="transition-all duration-200 hover:bg-red-500 hover:text-white"
      >
        Cancel
      </Button>
    )}
    <Button 
      type="submit"
      className="transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white"
    >
      {isEditing ? "Save Changes" : "Add Task"}
    </Button>
  </div>
);

export default TaskFormFooter;