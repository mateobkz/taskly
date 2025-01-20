import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Document, DocumentCategory } from "@/types/document";
import DocumentSection from "@/components/profile/DocumentSection";
import ProfileInfo from "@/components/profile/ProfileInfo";
import PreferencesSection from "@/components/profile/PreferencesSection";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    id: '',
    full_name: "",
    company_name: "",
    position: "",
    company_logo_url: "",
    bio: "",
    learning_goals: "",
    preferred_learning_style: "",
    skills: [] as string[],
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          id: user.id,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File, category: DocumentCategory) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: file.name,
          category,
          file_path: filePath,
        });

      if (dbError) throw dbError;

      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      const document = documents.find(d => d.id === id);
      if (!document) return;

      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6 animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileInfo
          profile={profile}
          onUpdate={(field, value) => setProfile(prev => ({ ...prev, [field]: value }))}
          onSave={handleProfileUpdate}
        />

        <PreferencesSection
          preferences={{
            learning_goals: profile.learning_goals,
            preferred_learning_style: profile.preferred_learning_style,
            skills: profile.skills,
          }}
          onUpdate={(field, value) => setProfile(prev => ({ ...prev, [field]: value }))}
          onAddSkill={(skill) => setProfile(prev => ({
            ...prev,
            skills: [...prev.skills, skill]
          }))}
          onRemoveSkill={(skillToRemove) => setProfile(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
          }))}
        />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['Resume', 'Recommendation Letter', 'Motivation Letter', 'Certificate'] as DocumentCategory[]).map((category) => (
            <DocumentSection
              key={category}
              category={category}
              documents={documents}
              onUpload={handleFileUpload}
              onDelete={handleDeleteDocument}
              onDownload={handleDownload}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;