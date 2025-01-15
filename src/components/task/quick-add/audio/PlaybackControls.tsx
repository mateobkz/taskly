import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Send, Loader2 } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  isProcessing: boolean;
  onTogglePlayback: () => void;
  onReset: () => void;
  onProcess: () => void;
}

const PlaybackControls = ({
  isPlaying,
  isProcessing,
  onTogglePlayback,
  onReset,
  onProcess,
}: PlaybackControlsProps) => {
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={onTogglePlayback}
        disabled={isProcessing}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        disabled={isProcessing}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      
      <Button
        variant="default"
        size="icon"
        onClick={onProcess}
        disabled={isProcessing}
        className="bg-green-600 hover:bg-green-700"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </>
  );
};

export default PlaybackControls;