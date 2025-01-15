import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, ListPlus, Mic, MicOff, Loader2 } from "lucide-react";
import QuickAddForm from "./QuickAddForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuickAddDialogProps {
  onTaskAdded: () => void;
}

const QuickAddDialog = ({ onTaskAdded }: QuickAddDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onload = async () => {
          if (typeof reader.result === 'string') {
            const base64Audio = reader.result.split(',')[1];
            await processAudio(base64Audio);
          }
        };
        
        reader.readAsDataURL(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsProcessing(true);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (base64Audio: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      if (data.text) {
        // Update the form with the transcribed text
        const event = new CustomEvent('voiceTranscription', { 
          detail: { text: data.text } 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Error",
        description: "Failed to process voice input. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 rounded-full h-14 px-6 shadow-lg bg-blue-600 hover:bg-blue-700 text-white animate-fade-in group transition-all duration-300 hover:scale-105"
          size="lg"
        >
          <Plus className="h-6 w-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium">Add Task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListPlus className="h-5 w-5 text-blue-500" />
            Quick Add Task
            <Button
              variant="outline"
              size="icon"
              className={`ml-auto ${isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>
        <QuickAddForm 
          onTaskAdded={() => {
            onTaskAdded();
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddDialog;