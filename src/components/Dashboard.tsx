import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Calendar,
  Search,
  Star,
  BookOpen
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, Mateo!</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> This Week
          </Button>
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" /> Search Tasks
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Tasks This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-muted-foreground">2 more than last week</p>
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