import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Task } from "@/types/task"
import TaskCard from "../task/TaskCard"
import TaskViewModal from "../task/TaskViewModal"

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
}

const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
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