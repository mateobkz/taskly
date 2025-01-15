import React, { useState, useRef } from "react";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      // Reset audio chunks
      audioChunksRef.current = [];

      // Request microphone access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;

      // Create and configure MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          setIsProcessing(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onload = async () => {
            if (typeof reader.result === 'string') {
              const base64Audio = reader.result.split(',')[1];
              await processAudio(base64Audio);
            }
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Error processing audio after recording:', error);
          toast({
            title: "Error",
            description: "Failed to process audio recording. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: "Recording Error",
          description: "An error occurred while recording. Please try again.",
          variant: "destructive",
        });
        stopRecording();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      // Automatically stop recording after 30 seconds
      setTimeout(() => {
        if (isRecording && mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 30000);

      toast({
        title: "Recording Started",
        description: "Speak clearly to describe your task. Recording will stop after 30 seconds.",
      });

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Error",
        description: "Could not access microphone. Please check your permissions and try again.",
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const processAudio = async (base64Audio: string) => {
    try {
      console.log('Processing audio...');
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error('Error from voice-to-text function:', error);
        throw error;
      }

      console.log('Transcription result:', data);

      if (data.text) {
        // Update the form with the transcribed text
        const event = new CustomEvent('voiceTranscription', { 
          detail: { text: data.text } 
        });
        window.dispatchEvent(event);
        
        toast({
          title: "Success",
          description: "Voice input processed successfully!",
        });
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
              className={`ml-auto ${
                isRecording 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
                  : ''
              }`}
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