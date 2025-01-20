import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface PreferencesSectionProps {
  preferences: {
    learning_goals: string;
    preferred_learning_style: string;
    skills: string[];
  };
  onUpdate: (field: string, value: string | string[]) => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

const PreferencesSection = ({
  preferences,
  onUpdate,
  onAddSkill,
  onRemoveSkill,
}: PreferencesSectionProps) => {
  const [newSkill, setNewSkill] = React.useState("");

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onAddSkill(newSkill.trim());
      setNewSkill("");
    }
  };

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Learning Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Learning Goals</label>
          <Textarea
            value={preferences.learning_goals || ''}
            onChange={(e) => onUpdate('learning_goals', e.target.value)}
            placeholder="What do you want to learn?"
            className="min-h-[100px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Preferred Learning Style</label>
          <Input
            value={preferences.preferred_learning_style || ''}
            onChange={(e) => onUpdate('preferred_learning_style', e.target.value)}
            placeholder="How do you learn best?"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Skills</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            />
            <Button onClick={handleAddSkill} size="icon">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {preferences.skills?.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 animate-fade-in"
              >
                {skill}
                <Trash2
                  className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => onRemoveSkill(skill)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesSection;