import React from "react";
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
import { Badge } from "@/components/ui/badge";
import { Target, Book, Brain, Clock, AlertTriangle, Lightbulb } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TaskFormFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, field?: string) => void;
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

const TaskFormFields = ({ formData, handleChange }: TaskFormFieldsProps) => {
  const { toast } = useToast();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'date_started' && formData.date_ended && value > formData.date_ended) {
      toast({
        title: "Invalid Date Range",
        description: "Start date cannot be after end date",
        variant: "destructive",
      });
      return;
    }
    
    if (name === 'date_ended' && formData.date_started && value < formData.date_started) {
      toast({
        title: "Invalid Date Range",
        description: "End date cannot be before start date",
        variant: "destructive",
      });
      return;
    }
    
    handleChange(e);
  };

  return (
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

        <div className="space-y-2">
          <Label htmlFor="key_challenges" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-500" />
            Key Challenges
          </Label>
          <Textarea
            id="key_challenges"
            name="key_challenges"
            value={formData.key_challenges}
            onChange={handleChange}
            placeholder="What difficulties did you face?"
            className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_started" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Start Date
            </Label>
            <Input 
              id="date_started"
              name="date_started"
              type="date"
              value={formData.date_started}
              onChange={handleDateChange}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_ended" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              End Date
            </Label>
            <Input 
              id="date_ended"
              name="date_ended"
              type="date"
              value={formData.date_ended}
              onChange={handleDateChange}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
              required 
            />
          </div>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="key_takeaways" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-blue-500" />
            Key Takeaways
          </Label>
          <Textarea
            id="key_takeaways"
            name="key_takeaways"
            value={formData.key_takeaways}
            onChange={handleChange}
            placeholder="What were your main learnings?"
            className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white/80"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default TaskFormFields;