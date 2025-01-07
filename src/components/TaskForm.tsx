import React from "react";
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

const TaskForm = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input id="title" placeholder="Brief description of the task" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Task Description</Label>
        <Textarea
          id="description"
          placeholder="Detailed explanation of what you did"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date of Completion</Label>
        <Input id="date" type="date" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="impact">Outcome/Impact</Label>
        <Textarea
          id="impact"
          placeholder="E.g., Improved reporting efficiency by 25%"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills Used</Label>
        <Input id="skills" placeholder="E.g., SQL, Excel, Python (comma-separated)" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="collaboration">Collaboration</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="independent">Independent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lessons">Lessons Learned (Optional)</Label>
        <Textarea
          id="lessons"
          placeholder="What did you learn from this task?"
        />
      </div>

      <Button type="submit" className="w-full">Add Task</Button>
    </form>
  );
};

export default TaskForm;