import React from "react";
import { Clipboard } from "lucide-react";

const Header = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto py-3">
        <div className="flex items-center justify-center gap-2">
          <Clipboard className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-semibold text-blue-500">Taskly</span>
        </div>
      </div>
    </div>
  );
};

export default Header;