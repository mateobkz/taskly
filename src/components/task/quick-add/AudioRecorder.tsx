import React from "react";
import { useAudioRecorder } from "./audio/useAudioRecorder";
import RecordingControls from "./audio/RecordingControls";
import PlaybackControls from "./audio/PlaybackControls";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

const AudioRecorder = ({ onTranscriptionComplete }: AudioRecorderProps) => {
  const {
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
    setIsPlaying
  } = useAudioRecorder(onTranscriptionComplete);

  return (
    <div className="flex items-center gap-2">
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)} 
        className="hidden"
      />
      
      {!hasRecording ? (
        <RecordingControls
          isRecording={isRecording}
          isProcessing={isProcessing}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />
      ) : (
        <PlaybackControls
          isPlaying={isPlaying}
          isProcessing={isProcessing}
          onTogglePlayback={togglePlayback}
          onReset={resetRecording}
          onProcess={processAudio}
        />
      )}
    </div>
  );
};

export default AudioRecorder;