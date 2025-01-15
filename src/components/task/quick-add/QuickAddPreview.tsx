import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuickAddPreviewProps {
  formData: any;
  setFormData: (data: any) => void;
  onTaskAdded: () => void;
}

const QuickAddPreview = ({ formData, setFormData, onTaskAdded }: QuickAddPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('tasks')
        .insert([{ ...formData, user_id: user.id }]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Task has been added successfully",
      });
      
      onTaskAdded();
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 space-y-4 bg-white/50 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm text-gray-500">Preview</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Modify
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Validate
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task title"
                  className="font-medium"
                />
              </div>
              
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task description"
                className="resize-none"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={formData.date_started}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    date_started: e.target.value,
                  })}
                />
                <Input
                  type="date"
                  value={formData.date_ended}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    date_ended: e.target.value,
                    date_completed: e.target.value,
                  })}
                />
              </div>

              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
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

              <Input
                value={formData.skills_acquired}
                onChange={(e) => setFormData({ ...formData, skills_acquired: e.target.value })}
                placeholder="Skills acquired (comma-separated)"
              />

              <Textarea
                value={formData.key_insights}
                onChange={(e) => setFormData({ ...formData, key_insights: e.target.value })}
                placeholder="Key insights (challenges and takeaways)"
                className="resize-none"
              />
            </>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium">{formData.title}</h4>
              <p className="text-sm text-gray-600">{formData.description}</p>
              <div className="flex gap-2 text-sm text-gray-500">
                <span>{new Date(formData.date_started).toLocaleDateString()}</span>
                <span>→</span>
                <span>{new Date(formData.date_ended).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                {formData.skills_acquired.split(',').map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
              <div className="text-sm">
                <span className={`px-2 py-1 rounded-md ${
                  formData.difficulty === 'Low' ? 'bg-green-50 text-green-700' :
                  formData.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {formData.difficulty}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Key Insights:</strong>
                <p>{formData.key_insights}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default QuickAddPreview;