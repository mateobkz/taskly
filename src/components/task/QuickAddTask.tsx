import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"

interface QuickAddTaskProps {
  onTaskAdded: () => void;
}

type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"]

const QuickAddTask = ({ onTaskAdded }: QuickAddTaskProps) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "" as DifficultyLevel,
    date_started: new Date().toISOString().split('T')[0],
    date_ended: new Date().toISOString().split('T')[0],
    date_completed: new Date().toISOString().split('T')[0], // Keep for backward compatibility
    description: "Quick task entry",
    skills_acquired: "",
    key_challenges: "Added via quick entry",
    key_takeaways: "Added via quick entry",
    duration_minutes: 30,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([formData])
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Task has been added successfully",
      })
      
      setOpen(false)
      onTaskAdded()
      setFormData({
        ...formData,
        title: "",
        difficulty: "" as DifficultyLevel,
        skills_acquired: "",
      })
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Quick Add Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What did you accomplish?"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value: DifficultyLevel) => setFormData({ ...formData, difficulty: value })}
              required
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              value={formData.skills_acquired}
              onChange={(e) => setFormData({ ...formData, skills_acquired: e.target.value })}
              placeholder="e.g., Python, React, SQL"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date_started}
              onChange={(e) => setFormData({ 
                ...formData, 
                date_started: e.target.value, 
                date_ended: e.target.value,
                date_completed: e.target.value // Update date_completed as well
              })}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default QuickAddTask