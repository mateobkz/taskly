import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, ListPlus } from "lucide-react";
import QuickAddForm from "./QuickAddForm";

interface QuickAddDialogProps {
  onTaskAdded: () => void;
}

const QuickAddDialog = ({ onTaskAdded }: QuickAddDialogProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 rounded-full h-14 px-6 shadow-lg bg-blue-600 hover:bg-blue-700 text-white animate-fade-in group transition-all duration-300 hover:scale-105"
          size="lg"
        >
          <Plus className="h-6 w-6 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium">Add Task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListPlus className="h-5 w-5 text-blue-500" />
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