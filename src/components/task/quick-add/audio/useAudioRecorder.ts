import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useAudioRecorder = (onTranscriptionComplete: (text: string) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setHasRecording(false);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true
      });
      
      streamRef.current = stream;
      console.log('Microphone access granted, stream created');

      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Received audio chunk of size:', event.data.size);
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        console.log('Recording stopped');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(audioBlob);
        }
        setHasRecording(true);
        setIsRecording(false);
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
      console.log('Recording started');

      recordingTimeoutRef.current = window.setTimeout(() => {
        if (isRecording) {
          console.log('Auto-stopping recording after 30 seconds');
          stopRecording();
          toast({
            title: "Recording Complete",
            description: "Maximum recording duration reached (30 seconds)",
          });
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
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('MediaRecorder stopped');
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Audio track stopped');
      });
      streamRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetRecording = () => {
    if (audioRef.current) {
      audioRef.current.src = '';
    }
    setHasRecording(false);
    setIsPlaying(false);
    audioChunksRef.current = [];
  };

  const processAudio = async () => {
    if (!hasRecording) return;

    try {
      setIsProcessing(true);
      console.log('Processing recorded audio...');

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          const base64Audio = reader.result.split(',')[1];
          
          console.log('Sending audio to voice-to-text function...');
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: { audio: base64Audio }
          });

          if (error) throw error;

          console.log('Transcription result:', data);
          if (data.text) {
            onTranscriptionComplete(data.text);
            toast({
              title: "Success",
              description: "Voice input processed successfully!",
            });
            resetRecording();
          }
        }
      };
      
      reader.readAsDataURL(audioBlob);
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

  return {
    isRecording,
    isProcessing,
    hasRecording,
    isPlaying,
    audioRef,
    startRecording,
    stopRecording,
    togglePlayback,
    resetRecording,
    processAudio,
  };
};