import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TaskDateFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TaskDateFields = ({ formData, handleChange }: TaskDateFieldsProps) => {
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
  );
};

export default TaskDateFields;