import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface TaskFormProps {
  onTaskAdded?: () => void;
}

const TaskForm = ({ onTaskAdded }: TaskFormProps) => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    
    // Here we would typically save the data
    // For now, just show success message
    toast({
      title: "Success",
      description: "Task has been saved successfully",
    });
    
    if (onTaskAdded) {
      onTaskAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input 
          id="title" 
          placeholder="Brief description of the task"
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Task Description</Label>
        <Textarea
          id="description"
          placeholder="Detailed explanation of what you did"
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date Completed</Label>
        <Input id="date" type="date" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills Acquired</Label>
        <Input 
          id="skills" 
          placeholder="E.g., SQL, Data Visualization (comma-separated)"
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty Level</Label>
        <Select required>
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="challenges">Key Challenges</Label>
        <Textarea
          id="challenges"
          placeholder="What difficulties did you face while completing this task?"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="takeaways">Key Takeaways</Label>
        <Textarea
          id="takeaways"
          placeholder="What did you learn? What were the significant outcomes?"
          required
        />
      </div>

      <Button type="submit" className="w-full">Add Task</Button>
    </form>
  );
};

export default TaskForm;