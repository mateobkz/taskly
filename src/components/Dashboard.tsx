import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart, 
  Calendar,
  Search,
  Star,
  BookOpen,
  Filter
} from "lucide-react";

interface Task {
  title: string;
  date: string;
  skills: string[];
  difficulty: 'Low' | 'Medium' | 'High';
}

// Mock data for demonstration - replace with actual data from storage
const mockTasks: Task[] = [
  {
    title: "SQL Data Analysis Project",
    date: "2024-03-10",
    skills: ["SQL", "Data Visualization"],
    difficulty: "Medium"
  },
  {
    title: "Weekly Report Automation",
    date: "2024-03-12",
    skills: ["Python", "Data Analysis"],
    difficulty: "High"
  }
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // Calculate weekly summary
  const getWeeklySummary = () => {
    console.log("Calculating weekly summary");
    const totalTasks = mockTasks.length;
    const skillCount: { [key: string]: number } = {};
    
    mockTasks.forEach(task => {
      task.skills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });

    const topSkill = Object.entries(skillCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
    
    return {
      totalTasks,
      topSkill,
      challengingTask: mockTasks.find(task => task.difficulty === "High")?.title || "None"
    };
  };

  const weeklySummary = getWeeklySummary();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, Mateo!</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> This Week
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Search Tasks</h4>
                  <Input 
                    placeholder="Search by title or skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Filter by Difficulty</h4>
                  <div className="flex gap-2">
                    {["Low", "Medium", "High"].map((diff) => (
                      <Button
                        key={diff}
                        variant={selectedDifficulty === diff ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDifficulty(diff === selectedDifficulty ? null : diff)}
                      >
                        {diff}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">Tasks Completed: {weeklySummary.totalTasks}</div>
              <div className="text-sm">Top Skill: {weeklySummary.topSkill}</div>
              <div className="text-sm">Most Challenging: {weeklySummary.challengingTask}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              Top Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">SQL</div>
              <div className="text-sm">Data Visualization</div>
              <div className="text-sm">Python</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Monthly Reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" /> Add Monthly Insights
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Accomplishments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">Pin your most significant achievements here</p>
            <Button variant="outline" className="w-full">
              <Star className="mr-2 h-4 w-4" /> Pin New Achievement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;