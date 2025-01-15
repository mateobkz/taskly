import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Filter, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDifficulty: 'Low' | 'Medium' | 'High' | null;
  setSelectedDifficulty: (difficulty: 'Low' | 'Medium' | 'High' | null) => void;
  handleLogout: () => void;
}

const FilterSection = ({
  searchQuery,
  setSearchQuery,
  selectedDifficulty,
  setSelectedDifficulty,
  handleLogout,
}: FilterSectionProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Button variant="outline" className="transition-all duration-200 hover:bg-accent hover:text-accent-foreground">
          <Calendar className="mr-2 h-4 w-4" /> This Week
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white border shadow-lg">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-black">Search Tasks</h4>
                <Input 
                  placeholder="Search by title or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <h4 className="font-medium mb-2 text-black">Filter by Difficulty</h4>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map((diff) => (
                    <Badge
                      key={diff}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedDifficulty === diff 
                          ? 'bg-accent text-black font-medium'
                          : 'bg-muted text-black hover:bg-accent/20'
                      }`}
                      onClick={() => setSelectedDifficulty(
                        diff === selectedDifficulty ? null : diff as 'Low' | 'Medium' | 'High'
                      )}
                    >
                      {diff}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Button
        variant="outline"
        onClick={handleLogout}
        className="transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
      >
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
};

export default FilterSection;