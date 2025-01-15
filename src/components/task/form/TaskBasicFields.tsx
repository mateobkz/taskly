import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, Book } from "lucide-react";

interface TaskBasicFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const TaskBasicFields = ({ formData, handleChange }: TaskBasicFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          Task Title
        </Label>
        <Input 
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What did you accomplish?"
          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center gap-2">
          <Book className="w-4 h-4 text-blue-500" />
          Task Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what you did in detail"
          className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
          required
        />
      </div>
    </div>
  );
};

export default TaskBasicFields;