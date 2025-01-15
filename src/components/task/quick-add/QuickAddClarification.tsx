import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface QuickAddClarificationProps {
  question: string;
  reasoning: string;
  response: string;
  onResponseChange: (response: string) => void;
  onSubmit: () => void;
  processing: boolean;
}

const QuickAddClarification = ({
  question,
  reasoning,
  response,
  onResponseChange,
  onSubmit,
  processing
}: QuickAddClarificationProps) => {
  return (
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
            <h3 className="font-medium text-blue-900">{question}</h3>
            <p className="text-sm text-blue-700">{reasoning}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Textarea
            value={response}
            onChange={(e) => onResponseChange(e.target.value)}
            placeholder="Your response..."
            className="resize-none bg-white/80"
          />
          <Button 
            onClick={onSubmit}
            disabled={!response.trim() || processing}
            className="w-full"
          >
            {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Submit Response
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default QuickAddClarification;