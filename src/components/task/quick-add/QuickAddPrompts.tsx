import React from "react";
import { Info } from "lucide-react";

const inputPrompts = [
  "📅 Include dates: when did you start/finish?",
  "⏱️ Mention duration in minutes",
  "📊 How difficult was it? (Low/Medium/High)",
  "🎯 What skills did you use or learn?",
  "💡 Share challenges faced and key learnings"
];

const QuickAddPrompts = () => {
  return (
    <div className="space-y-2">
      {inputPrompts.map((prompt, index) => (
        <div key={index} className="text-sm text-gray-500 flex items-center gap-2">
          <Info className="w-4 h-4" />
          {prompt}
        </div>
      ))}
    </div>
  );
};

export default QuickAddPrompts;