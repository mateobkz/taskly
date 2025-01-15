import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, Wand2, X, Check, Loader2, MessageCircle, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"]

interface QuickAddTaskProps {
  onTaskAdded: () => void;
}

const QuickAddTask = ({ onTaskAdded }: QuickAddTaskProps) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nlpInput, setNlpInput] = useState("")
  const [clarificationNeeded, setClarificationNeeded] = useState(false)
  const [clarificationQuestion, setClarificationQuestion] = useState("")
  const [clarificationReasoning, setClarificationReasoning] = useState("")
  const [clarificationResponse, setClarificationResponse] = useState("")
  const [processingNLP, setProcessingNLP] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "" as DifficultyLevel,
    date_started: new Date().toISOString().split('T')[0],
    date_ended: new Date().toISOString().split('T')[0],
    date_completed: new Date().toISOString().split('T')[0],
    description: "",
    skills_acquired: "",
    key_insights: "",
    duration_minutes: 30,
  })

  const inputPrompts = [
    "📅 Include dates: when did you start/finish?",
    "⏱️ Mention duration in minutes",
    "📊 How difficult was it? (Low/Medium/High)",
    "🎯 What skills did you use or learn?",
    "💡 Share challenges faced and key learnings"
  ]

  const handleNLPProcess = async (userResponse?: string) => {
    if (!nlpInput.trim() && !userResponse) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive",
      })
      return
    }

    setProcessingNLP(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase.functions.invoke('parse-task', {
        body: { 
          taskDescription: userResponse || nlpInput,
          userId: user.id,
          isInitialRequest: !userResponse
        },
      })

      if (error) throw error

      if (data.needsClarification) {
        setClarificationNeeded(true)
        setClarificationQuestion(data.question)
        setClarificationReasoning(data.reasoning)
        setShowPreview(false)
      } else {
        const { parsedTask } = data
        setFormData(prev => ({
          ...prev,
          title: parsedTask.title || prev.title,
          description: parsedTask.description || prev.description,
          date_started: parsedTask.date_started || prev.date_started,
          date_ended: parsedTask.date_ended || prev.date_ended,
          date_completed: parsedTask.date_ended || prev.date_completed,
          difficulty: (parsedTask.difficulty as DifficultyLevel) || prev.difficulty,
          skills_acquired: parsedTask.skills_acquired || prev.skills_acquired,
          key_insights: parsedTask.key_insights || prev.key_insights,
          duration_minutes: parsedTask.duration_minutes || prev.duration_minutes,
        }))
        setClarificationNeeded(false)
        setShowPreview(true)
      }

      toast({
        title: "Success",
        description: data.needsClarification ? 
          "Please provide additional information" : 
          "Task details extracted successfully",
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase
        .from('tasks')
        .insert([{ ...formData, user_id: user.id }])
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Task has been added successfully",
      })
      
      setOpen(false)
      onTaskAdded()
      setFormData({
        title: "",
        difficulty: "" as DifficultyLevel,
        date_started: new Date().toISOString().split('T')[0],
        date_ended: new Date().toISOString().split('T')[0],
        date_completed: new Date().toISOString().split('T')[0],
        description: "",
        skills_acquired: "",
        key_insights: "",
        duration_minutes: 30,
      })
      setNlpInput("")
      setShowPreview(false)
      setClarificationNeeded(false)
      setClarificationResponse("")
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

  const handleClarificationSubmit = () => {
    if (!clarificationResponse.trim()) {
      toast({
        title: "Error",
        description: "Please provide a response to the clarification question",
        variant: "destructive",
      })
      return
    }
    handleNLPProcess(clarificationResponse)
    setClarificationResponse("")
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

        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={nlpInput}
              onChange={(e) => {
                setNlpInput(e.target.value)
                if (showPreview) setShowPreview(false)
                if (clarificationNeeded) setClarificationNeeded(false)
              }}
              placeholder="Describe your task naturally..."
              className="min-h-[100px] pr-[100px] resize-none bg-gray-50/50 focus:bg-white transition-colors"
            />
            <Button
              size="sm"
              className="absolute right-2 top-2"
              onClick={() => handleNLPProcess()}
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

          <div className="space-y-2">
            {inputPrompts.map((prompt, index) => (
              <div key={index} className="text-sm text-gray-500 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {prompt}
              </div>
            ))}
          </div>

          <AnimatePresence>
            {clarificationNeeded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 space-y-4 bg-blue-50/50 backdrop-blur-sm border-blue-200">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-500 mt-1" />
                    <div className="space-y-2">
                      <h3 className="font-medium text-blue-900">{clarificationQuestion}</h3>
                      <p className="text-sm text-blue-700">{clarificationReasoning}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      value={clarificationResponse}
                      onChange={(e) => setClarificationResponse(e.target.value)}
                      placeholder="Your response..."
                      className="resize-none bg-white/80"
                    />
                    <Button 
                      onClick={handleClarificationSubmit}
                      disabled={!clarificationResponse.trim() || processingNLP}
                      className="w-full"
                    >
                      {processingNLP ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Submit Response
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {showPreview && (
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
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
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
                          onValueChange={(value: DifficultyLevel) => 
                            setFormData({ ...formData, difficulty: value })}
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
                          {formData.skills_acquired.split(',').map((skill, index) => (
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
              setClarificationNeeded(false)
              setClarificationResponse("")
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default QuickAddTask;
