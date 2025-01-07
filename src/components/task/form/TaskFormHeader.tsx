import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface TaskFormHeaderProps {
  isEditing: boolean;
}

const TaskFormHeader = ({ isEditing }: TaskFormHeaderProps) => (
  <CardHeader>
    <CardTitle className="text-2xl font-bold flex items-center gap-2">
      <Trophy className="w-6 h-6 text-blue-500" />
      {isEditing ? "Edit Task" : "Record New Achievement"}
    </CardTitle>
    <CardDescription>
      Document your learning journey and track your progress
    </CardDescription>
  </CardHeader>
);

export default TaskFormHeader;