import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalSet: () => void;
  currentGoal?: {
    id: number;
    title: string;
    target_value: number;
    current_value: number;
  };
}

const GoalModal = ({ isOpen, onClose, onGoalSet, currentGoal }: GoalModalProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(currentGoal?.title || "");
  const [targetValue, setTargetValue] = useState(currentGoal?.target_value?.toString() || "");
  const [category, setCategory] = useState("tasks");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting goal:", { title, targetValue, category });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const goalData = {
        title,
        target_value: parseInt(targetValue),
        current_value: currentGoal?.current_value || 0,
        period: "Weekly",
        category,
        user_id: user.id,
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        progress_data: {}
      };

      if (currentGoal?.id) {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', currentGoal.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('goals')
          .insert([goalData]);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Goal ${currentGoal ? 'updated' : 'created'} successfully`,
      });
      
      onGoalSet();
      onClose();
    } catch (error) {
      console.error("Error setting goal:", error);
      toast({
        title: "Error",
        description: "Failed to set goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{currentGoal ? 'Edit Goal' : 'Set Weekly Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Complete tasks this week"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetValue">Target Value</Label>
            <Input
              id="targetValue"
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="Enter target number"
              required
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tasks">Tasks</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="skills">Skills</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">
              {currentGoal ? 'Update Goal' : 'Set Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalModal;