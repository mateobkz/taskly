import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Task } from "@/types/task"
import TaskCard from "../task/TaskCard"
import TaskViewModal from "../task/TaskViewModal"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
}

const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [showAllTasks, setShowAllTasks] = useState(false)

  const displayedTasks = showAllTasks ? tasks : tasks.slice(0, 3)

  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Tasks</CardTitle>
          {tasks.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTasks(!showAllTasks)}
              className="flex items-center gap-1"
            >
              {showAllTasks ? (
                <>Show Less <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Show More <ChevronDown className="h-4 w-4" /></>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onView={(task) => {
                  setSelectedTask(task)
                  setIsViewModalOpen(true)
                }}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <TaskViewModal
        task={selectedTask}
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
      />
    </>
  )
}

export default TaskList