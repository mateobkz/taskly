import React from "react";
import QuickAddDialog from "./quick-add/QuickAddDialog";

interface QuickAddTaskProps {
  onTaskAdded: () => void;
}

const QuickAddTask = ({ onTaskAdded }: QuickAddTaskProps) => {
  return <QuickAddDialog onTaskAdded={onTaskAdded} />;
};

export default QuickAddTask;