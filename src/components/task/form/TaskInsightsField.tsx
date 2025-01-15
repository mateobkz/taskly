import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb } from "lucide-react";

interface TaskInsightsFieldProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TaskInsightsField = ({ formData, handleChange }: TaskInsightsFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="key_insights" className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-blue-500" />
        Key Insights
      </Label>
      <Textarea
        id="key_insights"
        name="key_insights"
        value={formData.key_insights}
        onChange={handleChange}
        placeholder="What were your main challenges and learnings from this task?"
        className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
        required
      />
    </div>
  );
};

export default TaskInsightsField;