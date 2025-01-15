import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid } from "lucide-react";

const DashboardSelect = () => {
  const { currentDashboard, dashboards, setCurrentDashboard } = useDashboard();

  const handleDashboardChange = (dashboardId: string) => {
    const dashboard = dashboards.find(d => d.id.toString() === dashboardId);
    if (dashboard) {
      setCurrentDashboard(dashboard);
    }
  };

  return (
    <Select
      value={currentDashboard?.id.toString()}
      onValueChange={handleDashboardChange}
    >
      <SelectTrigger className="w-[280px] bg-white">
        <div className="flex items-center gap-2">
          {currentDashboard?.logo_url ? (
            <img
              src={currentDashboard.logo_url}
              alt={currentDashboard.company_name || currentDashboard.name}
              className="w-5 h-5 object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          ) : (
            <Grid className="w-4 h-4" />
          )}
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
  );
};

export default DashboardSelect;