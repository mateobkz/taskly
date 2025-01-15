import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import QuickAddPreview from "./QuickAddPreview";
import QuickAddPrompts from "./QuickAddPrompts";
import QuickAddClarification from "./QuickAddClarification";

interface QuickAddFormProps {
  onTaskAdded: () => void;
}

const QuickAddForm = ({ onTaskAdded }: QuickAddFormProps) => {
  const { toast } = useToast();
  const [nlpInput, setNlpInput] = useState("");
  const [processingNLP, setProcessingNLP] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [clarificationNeeded, setClarificationNeeded] = useState(false);
  const [clarificationQuestion, setClarificationQuestion] = useState("");
  const [clarificationReasoning, setClarificationReasoning] = useState("");
  const [clarificationResponse, setClarificationResponse] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date_started: new Date().toISOString().split('T')[0],
    date_ended: new Date().toISOString().split('T')[0],
    date_completed: new Date().toISOString().split('T')[0],
    skills_acquired: "",
    difficulty: "",
    key_insights: "",
    duration_minutes: 30,
  });

  const handleNLPProcess = async (userResponse?: string) => {
    if (!nlpInput.trim() && !userResponse) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    setProcessingNLP(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.functions.invoke('parse-task', {
        body: { 
          taskDescription: userResponse || nlpInput,
          userId: user.id,
          isInitialRequest: !userResponse
        },
      });

      if (error) throw error;

      if (data.needsClarification) {
        setClarificationNeeded(true);
        setClarificationQuestion(data.question);
        setClarificationReasoning(data.reasoning);
        setShowPreview(false);
      } else {
        const { parsedTask } = data;
        setFormData(prev => ({
          ...prev,
          ...parsedTask,
        }));
        setClarificationNeeded(false);
        setShowPreview(true);
      }

      toast({
        title: "Success",
        description: data.needsClarification ? 
          "Please provide additional information" : 
          "Task details extracted successfully",
      });
    } catch (error) {
      console.error('Error processing NLP:', error);
      toast({
        title: "Error",
        description: "Failed to process task description. Please try manual entry.",
        variant: "destructive",
      });
    } finally {
      setProcessingNLP(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={nlpInput}
          onChange={(e) => {
            setNlpInput(e.target.value);
            if (showPreview) setShowPreview(false);
            if (clarificationNeeded) setClarificationNeeded(false);
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

      <QuickAddPrompts />

      {clarificationNeeded && (
        <QuickAddClarification
          question={clarificationQuestion}
          reasoning={clarificationReasoning}
          response={clarificationResponse}
          onResponseChange={setClarificationResponse}
          onSubmit={() => handleNLPProcess(clarificationResponse)}
          processing={processingNLP}
        />
      )}

      {showPreview && (
        <QuickAddPreview
          formData={formData}
          setFormData={setFormData}
          onTaskAdded={onTaskAdded}
        />
      )}
    </div>
  );
};

export default QuickAddForm;