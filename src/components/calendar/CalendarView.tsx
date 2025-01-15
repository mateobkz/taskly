import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Task } from '@/types/task';
import { format, isSameDay, differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Clock, CalendarRange } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

const CalendarView = ({ tasks, onTaskUpdate }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const startDate = new Date(task.date_started);
      const endDate = new Date(task.date_ended);
      const currentDate = new Date(date);
      
      currentDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      return currentDate >= startDate && currentDate <= endDate;
    });
  };

  const calendarStats = useMemo(() => {
    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => new Date(task.date_completed) <= new Date()).length,
      averageDuration: Math.round(tasks.reduce((acc, task) => acc + task.duration_minutes, 0) / tasks.length),
      tasksByDifficulty: {
        Low: tasks.filter(task => task.difficulty === 'Low').length,
        Medium: tasks.filter(task => task.difficulty === 'Medium').length,
        High: tasks.filter(task => task.difficulty === 'High').length,
      },
    };
    return stats;
  }, [tasks]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !selectedDate) return;

    const taskId = parseInt(result.draggableId);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;

    const newStartDate = new Date(selectedDate);
    const duration = differenceInDays(new Date(task.date_ended), new Date(task.date_started));
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + duration);

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          date_started: format(newStartDate, 'yyyy-MM-dd'),
          date_ended: format(newEndDate, 'yyyy-MM-dd'),
          date_completed: format(newEndDate, 'yyyy-MM-dd')
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task rescheduled successfully",
      });
      
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule task",
        variant: "destructive",
      });
    }
  };

  const getDayContent = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;

    return (
      <div className="w-full h-full flex items-center justify-center">
        <Badge 
          variant="secondary" 
          className={cn(
            "absolute bottom-1 right-1 w-5 h-5 p-0 flex items-center justify-center rounded-full",
            dayTasks.some(t => t.difficulty === 'High') && 'bg-red-100 text-red-700',
            dayTasks.some(t => t.difficulty === 'Medium') && !dayTasks.some(t => t.difficulty === 'High') && 'bg-yellow-100 text-yellow-700',
            dayTasks.every(t => t.difficulty === 'Low') && 'bg-green-100 text-green-700'
          )}
        >
          {dayTasks.length}
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-6">
        <Card className="p-4 bg-white/50 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-blue-500" />
              Calendar Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Total Tasks</div>
                <div className="text-2xl font-semibold">{calendarStats.totalTasks}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Completed</div>
                <div className="text-2xl font-semibold">{calendarStats.completedTasks}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600 mb-1">Avg. Duration</div>
                <div className="text-2xl font-semibold">{calendarStats.averageDuration}m</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-600 mb-1">Active Tasks</div>
                <div className="text-2xl font-semibold">
                  {calendarStats.totalTasks - calendarStats.completedTasks}
                </div>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-2xl border-0 shadow-md bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow p-4"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-lg font-medium text-gray-800",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "h-9 w-9 bg-transparent p-0 opacity-75 hover:opacity-100 transition-opacity rounded-full hover:bg-gray-100"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-500 rounded-md w-10 font-normal text-[0.9rem] mb-2",
                    row: "flex w-full mt-2",
                    cell: cn(
                      "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-blue-50 rounded-full",
                      "[&:has([aria-selected].day-range-end)]:rounded-r-md",
                      "[&:has([aria-selected].day-outside)]:bg-gray-50/50",
                      "[&:has([aria-selected])]:bg-gray-50",
                      "first:[&:has([aria-selected])]:rounded-l-md",
                      "last:[&:has([aria-selected])]:rounded-r-md",
                    ),
                    day: cn(
                      "h-10 w-10 p-0 font-normal rounded-full transition-colors hover:bg-blue-50 aria-selected:opacity-100",
                    ),
                    day_range_end: "day-range-end",
                    day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white",
                    day_today: "bg-gray-100 text-gray-900",
                    day_outside: "text-gray-400 opacity-50",
                    day_disabled: "text-gray-400 opacity-50",
                    day_hidden: "invisible",
                  }}
                  components={{
                    DayContent: ({ date }) => getDayContent(date),
                  }}
                />
                
                {selectedDate && (
                  <Droppable droppableId={format(selectedDate, 'yyyy-MM-dd')}>
                    {(provided) => (
                      <Card 
                        className="h-fit bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all rounded-2xl" 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                      >
                        <CardContent className="p-6 space-y-3">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-lg flex items-center gap-2">
                              <CalendarCheck className="h-5 w-5 text-blue-500" />
                              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
                            </h3>
                            <Clock className="h-4 w-4 text-blue-500" />
                          </div>
                          {getTasksForDate(selectedDate).map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id.toString()}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={cn(
                                          "p-3 rounded-md mb-2 cursor-grab active:cursor-grabbing transition-all duration-200",
                                          snapshot.isDragging ? "bg-accent shadow-lg scale-[1.02]" : "bg-muted hover:bg-accent/50",
                                          task.difficulty === 'Low' && 'border-l-4 border-green-500',
                                          task.difficulty === 'Medium' && 'border-l-4 border-yellow-500',
                                          task.difficulty === 'High' && 'border-l-4 border-red-500'
                                        )}
                                      >
                                        <div className="space-y-1">
                                          <h4 className="font-medium line-clamp-1">{task.title}</h4>
                                          <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-3 w-3" />
                                            {task.duration_minutes} minutes
                                          </div>
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-2">
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-sm">{task.description}</p>
                                        <div className="flex flex-wrap gap-1">
                                          {task.skills_acquired.split(',').map((skill, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                              {skill.trim()}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </CardContent>
                      </Card>
                    )}
                  </Droppable>
                )}
              </div>
            </DragDropContext>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-2">By Difficulty</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Priority</span>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {calendarStats.tasksByDifficulty.High}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Priority</span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      {calendarStats.tasksByDifficulty.Medium}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Priority</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {calendarStats.tasksByDifficulty.Low}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500 mb-2">Completion Rate</div>
                <div className="text-2xl font-semibold">
                  {Math.round((calendarStats.completedTasks / calendarStats.totalTasks) * 100)}%
                </div>
                <div className="text-sm text-gray-500">
                  {calendarStats.completedTasks} of {calendarStats.totalTasks} tasks completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
