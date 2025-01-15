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
import { Plus, Grid } from "lucide-react";

export default function DashboardSelector() {
  const {
    currentDashboard,
    dashboards,
    setCurrentDashboard,
    createDashboard,
  } = useDashboard();
  
  const [isNewDashboardOpen, setIsNewDashboardOpen] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');

  const handleCreateDashboard = async () => {
    if (!newDashboardName.trim()) return;
    await createDashboard(newDashboardName);
    setNewDashboardName('');
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
        <SelectTrigger className="w-[200px]">
          <Grid className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Select Dashboard" />
        </SelectTrigger>
        <SelectContent>
          {dashboards.map((dashboard) => (
            <SelectItem
              key={dashboard.id}
              value={dashboard.id.toString()}
            >
              {dashboard.name}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Dashboard Name"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
            />
            <Button onClick={handleCreateDashboard} className="w-full">
              Create Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}