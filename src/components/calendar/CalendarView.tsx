import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Task } from '@/types/task';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
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
      
      // Reset time components for accurate date comparison
      currentDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      return currentDate >= startDate && currentDate <= endDate;
    });
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !selectedDate) return;

    const taskId = parseInt(result.draggableId);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;

    const newStartDate = new Date(selectedDate);
    const duration = (new Date(task.date_ended).getTime() - new Date(task.date_started).getTime()) / (1000 * 60 * 60 * 24);
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

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border bg-white"
          />
          
          {selectedDate && (
            <Droppable droppableId={format(selectedDate, 'yyyy-MM-dd')}>
              {(provided) => (
                <Card className="h-fit" ref={provided.innerRef} {...provided.droppableProps}>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-medium">
                      Tasks for {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
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
                                    "p-3 rounded-md mb-2 cursor-grab active:cursor-grabbing",
                                    snapshot.isDragging ? "bg-accent" : "bg-muted",
                                    task.difficulty === 'Low' && 'border-l-4 border-green-500',
                                    task.difficulty === 'Medium' && 'border-l-4 border-yellow-500',
                                    task.difficulty === 'High' && 'border-l-4 border-red-500'
                                  )}
                                >
                                  <h4 className="font-medium">{task.title}</h4>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-medium">{task.title}</p>
                                  <p>Duration: {task.duration_minutes} minutes</p>
                                  <p>Difficulty: {task.difficulty}</p>
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
    </div>
  );
};

export default CalendarView;