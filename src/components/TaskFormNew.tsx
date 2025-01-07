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
import { motion } from "framer-motion";
import { Clock, Book, Target, Trophy, Brain } from "lucide-react";

interface TaskFormProps {
  onTaskAdded?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'low':
      return 'bg-green-100 text-black border-green-300 hover:bg-green-200';
    case 'medium':
      return 'bg-yellow-100 text-black border-yellow-300 hover:bg-yellow-200';
    case 'high':
      return 'bg-red-100 text-black border-red-300 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-black border-gray-300 hover:bg-gray-200';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        <Card className="transition-all duration-200 hover:shadow-lg bg-white/50 backdrop-blur-sm border-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-blue-500" />
              {isEditing ? "Edit Task" : "Record New Achievement"}
            </CardTitle>
            <CardDescription>
              Document your learning journey and track your progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_completed" className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Date Completed
                    </Label>
                    <Input 
                      id="date_completed"
                      name="date_completed"
                      type="date"
                      value={formData.date_completed}
                      onChange={handleChange}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes" className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Duration (min)
                    </Label>
                    <Input 
                      id="duration_minutes"
                      name="duration_minutes"
                      type="number"
                      min="0"
                      value={formData.duration_minutes}
                      onChange={handleChange}
                      placeholder="Duration in minutes"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-500" />
                    Difficulty Level
                  </Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => handleChange(value, 'difficulty')}
                    required
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
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

                <div className="space-y-2">
                  <Label htmlFor="skills_acquired" className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-500" />
                    Skills Acquired
                  </Label>
                  <Input 
                    id="skills_acquired"
                    name="skills_acquired"
                    value={formData.skills_acquired}
                    onChange={handleChange}
                    placeholder="E.g., Python, SQL, Data Visualization"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="key_challenges" className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Key Challenges
                </Label>
                <Textarea
                  id="key_challenges"
                  name="key_challenges"
                  value={formData.key_challenges}
                  onChange={handleChange}
                  placeholder="What difficulties did you face? How did you overcome them?"
                  className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key_takeaways" className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  Key Takeaways
                </Label>
                <Textarea
                  id="key_takeaways"
                  name="key_takeaways"
                  value={formData.key_takeaways}
                  onChange={handleChange}
                  placeholder="What were your main learnings from this task?"
                  className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onTaskAdded?.()}
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
          </CardContent>
        </Card>
      </form>
    </motion.div>
  );
};

export default TaskForm;