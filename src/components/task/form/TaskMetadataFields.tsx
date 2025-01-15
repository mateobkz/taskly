import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Target } from "lucide-react";

interface TaskMetadataFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement> | string, field?: string) => void;
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

const TaskMetadataFields = ({ formData, handleChange }: TaskMetadataFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="duration_minutes" className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Total Duration (min)
        </Label>
        <Input 
          id="duration_minutes"
          name="duration_minutes"
          type="number"
          min="0"
          value={formData.duration_minutes}
          onChange={handleChange}
          placeholder="Total duration in minutes"
          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
          required 
        />
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
          <Target className="w-4 h-4 text-blue-500" />
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
  );
};

export default TaskMetadataFields;