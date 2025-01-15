import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";

interface EnhanceTaskButtonProps {
  task: Task;
  onTaskUpdated: () => void;
}

const EnhanceTaskButton = ({ task, onTaskUpdated }: EnhanceTaskButtonProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const enhanceTask = async () => {
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-task', {
        body: { taskId: task.id }
      });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          description: data.enhancedDescription,
          key_insights: data.enhancedInsights,
          skills_acquired: data.enhancedSkills,
        })
        .eq('id', task.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Task has been enhanced with AI assistance",
      });
      
      onTaskUpdated();
    } catch (error) {
      console.error('Error enhancing task:', error);
      toast({
        title: "Error",
        description: "Failed to enhance task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={enhanceTask}
      disabled={isEnhancing}
      className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
    >
      {isEnhancing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="h-4 w-4" />
      )}
      Enhance with AI
    </Button>
  );
};

export default EnhanceTaskButton;