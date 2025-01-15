import React, { useState } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Grid, Upload } from "lucide-react";
import { cn } from '@/lib/utils';

export default function DashboardSelector() {
  const {
    currentDashboard,
    dashboards,
    setCurrentDashboard,
    createDashboard,
  } = useDashboard();
  
  const [isNewDashboardOpen, setIsNewDashboardOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    position: '',
    start_date: '',
    end_date: '',
    logo_url: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleCreateDashboard = async () => {
    if (!formData.name.trim()) return;

    let logoUrl = formData.logo_url;
    if (logoFile) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = logoFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, logoFile);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(filePath);
        logoUrl = publicUrl;
      }
    }

    await createDashboard({
      ...formData,
      logo_url: logoUrl,
    });

    setFormData({
      name: '',
      company_name: '',
      position: '',
      start_date: '',
      end_date: '',
      logo_url: '',
    });
    setLogoFile(null);
    setIsNewDashboardOpen(false);
  };

  const handleDashboardChange = (dashboardId: string) => {
    const dashboard = dashboards.find(d => d.id.toString() === dashboardId);
    if (dashboard) {
      setCurrentDashboard(dashboard);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentDashboard?.id.toString()}
        onValueChange={handleDashboardChange}
      >
        <SelectTrigger className="w-[280px] bg-white">
          <div className="flex items-center gap-2">
            {currentDashboard?.logo_url && (
              <img
                src={currentDashboard.logo_url}
                alt={currentDashboard.company_name || currentDashboard.name}
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            )}
            <Grid className="w-4 h-4" />
            <SelectValue placeholder="Select Dashboard" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {dashboards.map((dashboard) => (
            <SelectItem
              key={dashboard.id}
              value={dashboard.id.toString()}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                {dashboard.logo_url && (
                  <img
                    src={dashboard.logo_url}
                    alt={dashboard.company_name || dashboard.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                )}
                <span>{dashboard.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isNewDashboardOpen} onOpenChange={setIsNewDashboardOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dashboard Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Experience at Company"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Company Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Your Role"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex gap-4">
                <Input
                  value={formData.logo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="Logo URL"
                  className="flex-1"
                />
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setLogoFile(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
              {(formData.logo_url || logoFile) && (
                <div className="mt-2 p-4 border rounded-lg">
                  <img
                    src={logoFile ? URL.createObjectURL(logoFile) : formData.logo_url}
                    alt="Preview"
                    className="h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCreateDashboard}>Create Dashboard</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}