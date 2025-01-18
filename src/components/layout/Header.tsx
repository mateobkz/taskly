import React from "react";
import { Clipboard } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardSelector from "../dashboard/DashboardSelector";
import { useDashboard } from "@/contexts/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { isLoading, currentDashboard } = useDashboard();

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Clipboard className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-semibold text-blue-500">Taskly</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/applications">
                <Button variant="ghost">Applications</Button>
              </Link>
              {currentDashboard?.company_name && (
                <>
                  <div className="h-6 w-px bg-gray-200" />
                  <div className="flex items-center gap-2">
                    {currentDashboard.logo_url && (
                      <img
                        src={currentDashboard.logo_url}
                        alt={currentDashboard.company_name}
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    )}
                    <span className="text-sm font-medium text-gray-600">
                      {currentDashboard.company_name}
                      {currentDashboard.position && ` - ${currentDashboard.position}`}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <Skeleton className="w-[280px] h-10" />
          ) : (
            <DashboardSelector />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;