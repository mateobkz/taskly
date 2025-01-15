import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDashboard } from '@/contexts/DashboardContext';

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createDashboard } = useDashboard();

  const [profileData, setProfileData] = useState({
    full_name: '',
    company_name: '',
    position: '',
    bio: '',
  });

  const [dashboardData, setDashboardData] = useState({
    name: '',
    company_name: '',
    position: '',
    start_date: '',
    end_date: '',
  });

  const handleProfileSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          company_name: profileData.company_name,
          position: profileData.position,
          bio: profileData.bio,
        })
        .eq('id', user.id);

      if (error) throw error;

      setStep(2);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDashboardSubmit = async () => {
    try {
      await createDashboard(dashboardData);
      setOpen(false);
      toast({
        title: "Success",
        description: "Your first dashboard has been created!",
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to create dashboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const skipDashboard = () => {
    setOpen(false);
    navigate('/');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Welcome! Let's set up your profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={profileData.company_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={profileData.position}
                  onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Your position"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleProfileSubmit}>Continue</Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create your first dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dashboard_name">Dashboard Name</Label>
                <Input
                  id="dashboard_name"
                  value={dashboardData.name}
                  onChange={(e) => setDashboardData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Experience at Company"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dashboard_company">Company Name</Label>
                <Input
                  id="dashboard_company"
                  value={dashboardData.company_name}
                  onChange={(e) => setDashboardData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dashboard_position">Position</Label>
                <Input
                  id="dashboard_position"
                  value={dashboardData.position}
                  onChange={(e) => setDashboardData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Your Role"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={dashboardData.start_date}
                    onChange={(e) => setDashboardData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={dashboardData.end_date}
                    onChange={(e) => setDashboardData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={skipDashboard}>Skip for now</Button>
              <Button onClick={handleDashboardSubmit}>Create Dashboard</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}