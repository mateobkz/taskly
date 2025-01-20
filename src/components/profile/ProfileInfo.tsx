import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileInfoProps {
  profile: {
    full_name: string;
    company_name: string;
    position: string;
    bio: string;
  };
  onUpdate: (field: string, value: string) => void;
  onSave: () => void;
}

const ProfileInfo = ({ profile, onUpdate, onSave }: ProfileInfoProps) => {
  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <Input
            value={profile.full_name || ''}
            onChange={(e) => onUpdate('full_name', e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Company</label>
          <Input
            value={profile.company_name || ''}
            onChange={(e) => onUpdate('company_name', e.target.value)}
            placeholder="Current company"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Position</label>
          <Input
            value={profile.position || ''}
            onChange={(e) => onUpdate('position', e.target.value)}
            placeholder="Current position"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Bio</label>
          <Input
            value={profile.bio || ''}
            onChange={(e) => onUpdate('bio', e.target.value)}
            placeholder="Tell us about yourself"
          />
        </div>

        <Button onClick={onSave} className="w-full">
          Update Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileInfo;