import React, { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";

interface TaskFormProps {
  onTaskAdded?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const TaskForm = ({ onTaskAdded, initialData, isEditing }: TaskFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    date_completed: initialData?.date_completed || "",
    skills_acquired: initialData?.skills_acquired || "",
    difficulty: initialData?.difficulty || "",
    key_challenges: initialData?.key_challenges || "",
    key_takeaways: initialData?.key_takeaways || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, field?: string) => {
    if (typeof e === 'string' && field) {
      setFormData(prev => ({ ...prev, [field]: e }));
    } else if (typeof e !== 'string') {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    
    try {
      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from('tasks')
          .update(formData)
          .eq('id', initialData.id);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Task has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([formData]);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Task has been saved successfully",
        });
      }
      
      if (onTaskAdded) {
        onTaskAdded();
      }
      
      if (!isEditing) {
        // Reset form only for new tasks
        setFormData({
          title: "",
          description: "",
          date_completed: "",
          skills_acquired: "",
          difficulty: "",
          key_challenges: "",
          key_takeaways: "",
        });
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input 
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Brief description of the task"
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Task Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detailed explanation of what you did"
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_completed">Date Completed</Label>
        <Input 
          id="date_completed"
          name="date_completed"
          type="date"
          value={formData.date_completed}
          onChange={handleChange}
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills_acquired">Skills Acquired</Label>
        <Input 
          id="skills_acquired"
          name="skills_acquired"
          value={formData.skills_acquired}
          onChange={handleChange}
          placeholder="E.g., SQL, Data Visualization (comma-separated)"
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty Level</Label>
        <Select 
          value={formData.difficulty} 
          onValueChange={(value) => handleChange(value, 'difficulty')}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="key_challenges">Key Challenges</Label>
        <Textarea
          id="key_challenges"
          name="key_challenges"
          value={formData.key_challenges}
          onChange={handleChange}
          placeholder="What difficulties did you face while completing this task?"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="key_takeaways">Key Takeaways</Label>
        <Textarea
          id="key_takeaways"
          name="key_takeaways"
          value={formData.key_takeaways}
          onChange={handleChange}
          placeholder="What did you learn? What were the significant outcomes?"
          required
        />
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? "Update Task" : "Add Task"}
      </Button>
    </form>
  );
};

export default TaskForm;