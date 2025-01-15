import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { extractDomainFromCompany } from "@/utils/companyUtils";
import { removeBackground, loadImage } from "@/utils/imageUtils";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2 } from "lucide-react";

interface ProfileData {
  full_name: string;
  company_name: string;
  position: string;
  company_logo_url: string;
  bio: string;
  learning_goals: string;
  preferred_learning_style: string;
  skills: string[];
  social_links: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    company_name: "",
    position: "",
    company_logo_url: "",
    bio: "",
    learning_goals: "",
    preferred_learning_style: "",
    skills: [],
    social_links: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [newSkill, setNewSkill] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          ...data,
          skills: data.skills || [],
          social_links: data.social_links || {},
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let logoUrl = profile.company_logo_url;

      if (profile.company_name) {
        const domain = extractDomainFromCompany(profile.company_name);
        const logoResponse = await fetch(`https://logo.clearbit.com/${domain}`);
        
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          const logoImage = await loadImage(logoBlob);
          const processedLogoBlob = await removeBackground(logoImage);
          
          // Upload the processed logo to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('logos')
            .upload(`${user.id}/${domain}.png`, processedLogoBlob, {
              upsert: true,
            });

          if (uploadError) throw uploadError;
          
          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('logos')
              .getPublicUrl(uploadData.path);
            
            logoUrl = publicUrl;
          }
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          company_logo_url: logoUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Company</label>
              <Input
                value={profile.company_name}
                onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Enter your company name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Position</label>
              <Input
                value={profile.position}
                onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Enter your position"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself"
                className="h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Learning Goals</label>
              <Textarea
                value={profile.learning_goals}
                onChange={(e) => setProfile(prev => ({ ...prev, learning_goals: e.target.value }))}
                placeholder="What do you want to learn?"
                className="h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Preferred Learning Style</label>
              <Input
                value={profile.preferred_learning_style}
                onChange={(e) => setProfile(prev => ({ ...prev, preferred_learning_style: e.target.value }))}
                placeholder="How do you learn best?"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Skills</label>
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
                {profile.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <Trash2
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Social Links</label>
              <div className="space-y-2">
                <Input
                  value={profile.social_links.linkedin || ""}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, linkedin: e.target.value }
                  }))}
                  placeholder="LinkedIn URL"
                />
                <Input
                  value={profile.social_links.github || ""}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, github: e.target.value }
                  }))}
                  placeholder="GitHub URL"
                />
                <Input
                  value={profile.social_links.twitter || ""}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, twitter: e.target.value }
                  }))}
                  placeholder="Twitter URL"
                />
              </div>
            </div>

            {profile.company_logo_url && (
              <div className="mt-4">
                <label className="text-sm font-medium">Company Logo Preview</label>
                <div className="mt-2 p-4 border rounded-lg">
                  <img
                    src={profile.company_logo_url}
                    alt="Company Logo"
                    className="h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <Button onClick={handleUpdate} className="w-full">
            Update Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;