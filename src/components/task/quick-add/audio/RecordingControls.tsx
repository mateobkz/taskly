import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff } from "lucide-react";

interface RecordingControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const RecordingControls = ({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
}: RecordingControlsProps) => {
  return (
    <Button
      variant={isRecording ? "destructive" : "outline"}
      size="icon"
      onClick={isRecording ? onStopRecording : onStartRecording}
      disabled={isProcessing}
      className={isRecording ? "animate-pulse" : ""}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};

export default RecordingControls;