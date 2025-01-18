import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase, ClipboardList } from "lucide-react";
import AuthStateHandler from "@/components/layout/AuthStateHandler";

const Lobby = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <AuthStateHandler />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Taskly</h1>
          <p className="text-lg text-gray-600">Choose where you'd like to go</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link to="/applications" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-blue-500" />
                  Job Applications
                </CardTitle>
                <CardDescription>
                  Track your job search journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Manage your job applications, keep track of interviews, and organize your job search process all in one place.
                </p>
                <Button className="mt-4 w-full">Go to Applications</Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/tasks" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-6 w-6 text-green-500" />
                  Work Dashboard
                </CardTitle>
                <CardDescription>
                  Track your learning and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monitor your work tasks, track learning progress, and document your professional growth journey.
                </p>
                <Button className="mt-4 w-full">Go to Dashboard</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Lobby;