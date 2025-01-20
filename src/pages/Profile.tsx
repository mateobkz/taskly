import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DocumentCategory } from "@/types/document";
import DocumentSection from "@/components/profile/DocumentSection";
import ProfileInfo from "@/components/profile/ProfileInfo";
import PreferencesSection from "@/components/profile/PreferencesSection";
import { useDocuments } from "@/hooks/useDocuments";
import { useProfile } from "@/hooks/useProfile";

const Profile = () => {
  const navigate = useNavigate();
  const { 
    documents, 
    isLoading: documentsLoading, 
    uploadDocument, 
    deleteDocument, 
    downloadDocument,
    fetchDocuments 
  } = useDocuments();
  
  const {
    profile,
    isLoading: profileLoading,
    fetchProfile,
    updateProfile
  } = useProfile();

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, [fetchProfile, fetchDocuments]);

  if (documentsLoading || profileLoading) {
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
          onUpdate={(field, value) => updateProfile({ [field]: value })}
          onSave={() => updateProfile(profile)}
        />

        <PreferencesSection
          preferences={{
            learning_goals: profile.learning_goals,
            preferred_learning_style: profile.preferred_learning_style,
            skills: profile.skills,
          }}
          onUpdate={(field, value) => updateProfile({ [field]: value })}
          onAddSkill={(skill) => updateProfile({
            skills: [...profile.skills, skill]
          })}
          onRemoveSkill={(skillToRemove) => updateProfile({
            skills: profile.skills.filter(skill => skill !== skillToRemove)
          })}
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
              onUpload={uploadDocument}
              onDelete={deleteDocument}
              onDownload={downloadDocument}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;