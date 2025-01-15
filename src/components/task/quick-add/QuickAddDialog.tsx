import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import QuickAddForm from "./QuickAddForm";
import { Task } from "@/types/task";

interface QuickAddDialogProps {
  onTaskAdded: () => void;
}

const QuickAddDialog = ({ onTaskAdded }: QuickAddDialogProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white animate-fade-in"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Quick Add Task
          </DialogTitle>
        </DialogHeader>
        <QuickAddForm 
          onTaskAdded={() => {
            onTaskAdded();
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddDialog;