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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Wand2, X, Check, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"]

interface QuickAddTaskProps {
  onTaskAdded: () => void;
}

const QuickAddTask = ({ onTaskAdded }: QuickAddTaskProps) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nlpInput, setNlpInput] = useState("")
  const [processingNLP, setProcessingNLP] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
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
      const { data, error } = await supabase.functions.invoke('parse-task', {
        body: { taskDescription: nlpInput },
      });

      if (error) throw error;
      if (!data.parsedTask) throw new Error("Failed to parse task details");

      const { parsedTask } = data;
      console.log('Parsed task:', parsedTask);

      setFormData(prev => ({
        ...prev,
        title: parsedTask.title || prev.title,
        date_started: parsedTask.date_started || prev.date_started,
        date_ended: parsedTask.date_ended || prev.date_ended,
        date_completed: parsedTask.date_ended || prev.date_completed,
        difficulty: (parsedTask.difficulty as DifficultyLevel) || prev.difficulty,
        skills_acquired: parsedTask.skills_acquired || prev.skills_acquired,
      }))

      setShowPreview(true)
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

  const handleSubmit = async () => {
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
      setShowPreview(false)
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-500" />
            Quick Add Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative">
            <Textarea
              value={nlpInput}
              onChange={(e) => {
                setNlpInput(e.target.value)
                if (showPreview) setShowPreview(false)
              }}
              placeholder="Describe your task naturally, e.g.: Complete the marketing report by Jan 20, 2025, difficulty medium, skills: Excel, analysis"
              className="min-h-[100px] pr-[100px] resize-none bg-gray-50/50 focus:bg-white transition-colors"
            />
            <Button
              size="sm"
              className="absolute right-2 top-2"
              onClick={handleNLPProcess}
              disabled={processingNLP || !nlpInput.trim()}
            >
              {processingNLP ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              <span className="ml-2">Process</span>
            </Button>
          </div>

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 space-y-4 bg-white/50 backdrop-blur-sm">
                  <h3 className="font-medium text-sm text-gray-500">Preview</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value: DifficultyLevel) => 
                          setFormData({ ...formData, difficulty: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Skills</Label>
                      <Input
                        value={formData.skills_acquired}
                        onChange={(e) => setFormData({ ...formData, skills_acquired: e.target.value })}
                        placeholder="e.g., Python, React, SQL"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={formData.date_started}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            date_started: e.target.value,
                          })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={formData.date_ended}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            date_ended: e.target.value,
                            date_completed: e.target.value,
                          })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
              setShowPreview(false)
              setNlpInput("")
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          {showPreview && (
            <Button onClick={handleSubmit} disabled={loading}>
              <Check className="w-4 h-4 mr-2" />
              {loading ? "Adding..." : "Add Task"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default QuickAddTask