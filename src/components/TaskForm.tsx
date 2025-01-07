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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaskFormProps {
  onTaskAdded?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

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
    duration_minutes: initialData?.duration_minutes || 0,
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
        setFormData({
          title: "",
          description: "",
          date_completed: "",
          skills_acquired: "",
          difficulty: "",
          key_challenges: "",
          key_takeaways: "",
          duration_minutes: 0,
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
      <Card className="transition-all duration-200">
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>
            Record your learning journey and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input 
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What did you accomplish?"
              className="transition-all duration-200 focus:ring-2 focus:ring-accent"
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
              placeholder="Describe what you did in detail"
              className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_completed">Date Completed</Label>
              <Input 
                id="date_completed"
                name="date_completed"
                type="date"
                value={formData.date_completed}
                onChange={handleChange}
                className="transition-all duration-200 focus:ring-2 focus:ring-accent"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input 
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="0"
                value={formData.duration_minutes}
                onChange={handleChange}
                placeholder="Duration in minutes"
                className="transition-all duration-200 focus:ring-2 focus:ring-accent"
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
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-accent bg-background">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  <SelectItem value="Low">
                    <Badge className={getDifficultyColor('Low')}>Low</Badge>
                  </SelectItem>
                  <SelectItem value="Medium">
                    <Badge className={getDifficultyColor('Medium')}>Medium</Badge>
                  </SelectItem>
                  <SelectItem value="High">
                    <Badge className={getDifficultyColor('High')}>High</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills_acquired">Skills Acquired</Label>
            <Input 
              id="skills_acquired"
              name="skills_acquired"
              value={formData.skills_acquired}
              onChange={handleChange}
              placeholder="E.g., Python, SQL, Data Visualization (comma-separated)"
              className="transition-all duration-200 focus:ring-2 focus:ring-accent"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key_challenges">Key Challenges</Label>
            <Textarea
              id="key_challenges"
              name="key_challenges"
              value={formData.key_challenges}
              onChange={handleChange}
              placeholder="What difficulties did you face? How did you overcome them?"
              className="transition-all duration-200 focus:ring-2 focus:ring-accent"
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
              placeholder="What were your main learnings from this task?"
              className="transition-all duration-200 focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onTaskAdded?.()}
                className="transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit"
              className="transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
            >
              {isEditing ? "Save Changes" : "Add Task"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default TaskForm;
