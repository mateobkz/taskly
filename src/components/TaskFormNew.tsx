import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import TaskFormHeader from "./task/form/TaskFormHeader";
import TaskFormFields from "./task/form/TaskFormFields";
import TaskFormFooter from "./task/form/TaskFormFooter";

interface TaskFormProps {
  onTaskAdded?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const TaskForm = ({ onTaskAdded, initialData, isEditing = false }: TaskFormProps) => {
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
          <TaskFormHeader isEditing={isEditing} />
          <CardContent className="space-y-6">
            <TaskFormFields 
              formData={formData}
              handleChange={handleChange}
            />
            <TaskFormFooter 
              isEditing={isEditing}
              onCancel={() => onTaskAdded?.()}
            />
          </CardContent>
        </Card>
      </form>
    </motion.div>
  );
};

export default TaskForm;