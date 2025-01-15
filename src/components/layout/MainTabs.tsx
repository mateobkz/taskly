import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/Dashboard";
import TaskForm from "@/components/TaskFormNew";
import CalendarView from "@/components/calendar/CalendarView";
import Profile from "@/pages/Profile";
import Tasks from "@/pages/Tasks";
import { Task } from "@/types/task";

interface MainTabsProps {
  tasks: Task[];
  onTaskAdded: () => void;
  refetchTasks: () => void;
}

const MainTabs = ({ tasks, onTaskAdded, refetchTasks }: MainTabsProps) => {
  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
        <TabsList className="bg-white/50 backdrop-blur-sm">
          <TabsTrigger 
            value="dashboard"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="tasks"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="calendar"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Calendar
          </TabsTrigger>
          <TabsTrigger 
            value="add-task"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Add Task
          </TabsTrigger>
          <TabsTrigger 
            value="profile"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Profile
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="dashboard" className="space-y-4">
        <Dashboard />
      </TabsContent>

      <TabsContent value="tasks" className="space-y-4">
        <Tasks />
      </TabsContent>

      <TabsContent value="calendar" className="space-y-4">
        <CalendarView tasks={tasks} onTaskUpdate={refetchTasks} />
      </TabsContent>
      
      <TabsContent value="add-task">
        <TaskForm onTaskAdded={onTaskAdded} />
      </TabsContent>

      <TabsContent value="profile">
        <Profile />
      </TabsContent>
    </Tabs>
  );
};

export default MainTabs;