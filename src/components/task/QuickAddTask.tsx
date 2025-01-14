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
import { Plus, Wand2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface QuickAddTaskProps {
  onTaskAdded: () => void;
}

type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"]

const QuickAddTask = ({ onTaskAdded }: QuickAddTaskProps) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nlpInput, setNlpInput] = useState("")
  const [processingNLP, setProcessingNLP] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "" as DifficultyLevel,
    date_started: new Date().toISOString().split('T')[0],
    date_ended: new Date().toISOString().split('T')[0],
    date_completed: new Date().toISOString().split('T')[0],
    description: "Quick task entry",
    skills_acquired: "",
    key_challenges: "Added via quick entry",
    key_takeaways: "Added via quick entry",
    duration_minutes: 30,
  })

  const handleNLPProcess = async () => {
    if (!nlpInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive",
      })
      return
    }

    setProcessingNLP(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-task`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskDescription: nlpInput }),
        }
      )

      const { parsedTask, error } = await response.json()
      
      if (error) throw new Error(error)
      if (!parsedTask) throw new Error("Failed to parse task details")

      setFormData(prev => ({
        ...prev,
        title: parsedTask.title || prev.title,
        date_started: parsedTask.date_started || prev.date_started,
        date_ended: parsedTask.date_ended || prev.date_ended,
        date_completed: parsedTask.date_ended || prev.date_completed,
        difficulty: (parsedTask.difficulty as DifficultyLevel) || prev.difficulty,
        skills_acquired: parsedTask.skills_acquired || prev.skills_acquired,
      }))

      toast({
        title: "Success",
        description: "Task details extracted successfully",
      })
    } catch (error) {
      console.error('Error processing NLP:', error)
      toast({
        title: "Error",
        description: "Failed to process task description. Please try manual entry.",
        variant: "destructive",
      })
    } finally {
      setProcessingNLP(false)
    }
  }

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
      setNlpInput("")
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
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white animate-fade-in"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Natural Language Input</Label>
            <div className="flex gap-2">
              <Textarea
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
                placeholder="Describe your task naturally, e.g.: Complete the marketing report by Jan 20, 2025, difficulty medium, skills: Excel, analysis"
                className="min-h-[80px]"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleNLPProcess}
              disabled={processingNLP}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {processingNLP ? "Processing..." : "Extract Details"}
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              Review and adjust the extracted details below if needed
            </AlertDescription>
          </Alert>
          
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.date_started}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  date_started: e.target.value,
                })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.date_ended}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  date_ended: e.target.value,
                  date_completed: e.target.value,
                })}
                required
              />
            </div>
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