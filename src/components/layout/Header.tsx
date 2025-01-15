import React from "react";
import { Clipboard } from "lucide-react";
import DashboardSelector from "../dashboard/DashboardSelector";
import { useDashboard } from "@/contexts/DashboardContext";
import { Skeleton } from "@/components/ui/skeleton";

const Header = () => {
  const { isLoading } = useDashboard();

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clipboard className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-semibold text-blue-500">Taskly</span>
          </div>
          
          {isLoading ? (
            <Skeleton className="w-[200px] h-10" />
          ) : (
            <DashboardSelector />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;