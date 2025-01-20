import React, { useState, useEffect } from "react";
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
    date_started: initialData?.date_started || new Date().toISOString().split('T')[0],
    date_ended: initialData?.date_ended || new Date().toISOString().split('T')[0],
    date_completed: initialData?.date_completed || new Date().toISOString().split('T')[0],
    skills_acquired: initialData?.skills_acquired || "",
    difficulty: initialData?.difficulty || "",
    key_challenges: initialData?.key_challenges || "",
    key_takeaways: initialData?.key_takeaways || "",
    key_insights: initialData?.key_insights || "",
    duration_minutes: initialData?.duration_minutes || 0,
    user_id: initialData?.user_id || null,
    related_company: initialData?.related_company || "",
    related_position: initialData?.related_position || "",
    subtasks: initialData?.subtasks || [],
    ai_suggestions: initialData?.ai_suggestions || {},
  });

  console.log("Initial data received:", initialData);

  useEffect(() => {
    const setUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({ ...prev, user_id: user.id }));
      }
    };
    
    if (!isEditing) {
      setUserId();
    }
  }, [isEditing]);

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
    console.log("Is editing:", isEditing);
    console.log("Initial data ID:", initialData?.id);
    
    try {
      if (isEditing && initialData?.id) {
        console.log("Updating task with ID:", initialData.id);
        const { error } = await supabase
          .from('tasks')
          .update(formData)
          .eq('id', initialData.id)
          .select();
        
        if (error) {
          console.error("Error updating task:", error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Task has been updated successfully",
        });
      } else {
        console.log("Creating new task");
        const { error } = await supabase
          .from('tasks')
          .insert([formData])
          .select();
        
        if (error) {
          console.error("Error creating task:", error);
          throw error;
        }
        
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
          date_started: new Date().toISOString().split('T')[0],
          date_ended: new Date().toISOString().split('T')[0],
          date_completed: new Date().toISOString().split('T')[0],
          skills_acquired: "",
          difficulty: "",
          key_challenges: "",
          key_takeaways: "",
          key_insights: "",
          duration_minutes: 0,
          user_id: formData.user_id,
          related_company: "",
          related_position: "",
          subtasks: [],
          ai_suggestions: {},
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