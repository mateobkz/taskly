import React, { useState } from "react";
import { Application } from "@/types/application";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Copy, Edit, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApplicationRowProps {
  application: Application;
  onDelete: (id: number) => void;
  onEdit: (application: Application) => void;
  onClone: (application: Application) => void;
  getStatusColor: (status: Application['status']) => string;
}

const ApplicationRow = ({ 
  application, 
  onDelete, 
  onEdit,
  onClone,
  getStatusColor 
}: ApplicationRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(application);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('applications')
        .update(editedData)
        .eq('id', application.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application updated successfully",
      });
      onEdit(editedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      });
    }
  };

  const handleClone = async () => {
    const clonedApplication = {
      ...application,
      id: undefined,
      company_name: `${application.company_name} (Copy)`,
      application_date: new Date().toISOString().split('T')[0],
      status: "To Apply" as const,
    };
    onClone(clonedApplication);
  };

  if (isEditing) {
    return (
      <TableRow>
        <TableCell>
          <Input
            value={editedData.company_name}
            onChange={(e) => setEditedData({ ...editedData, company_name: e.target.value })}
          />
        </TableCell>
        <TableCell>
          <Input
            value={editedData.position}
            onChange={(e) => setEditedData({ ...editedData, position: e.target.value })}
          />
        </TableCell>
        <TableCell>
          <Input
            value={editedData.location || ""}
            onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
          />
        </TableCell>
        <TableCell>
          <Input
            type="date"
            value={editedData.application_date?.split('T')[0]}
            onChange={(e) => setEditedData({ ...editedData, application_date: e.target.value })}
          />
        </TableCell>
        <TableCell>
          <Select
            value={editedData.status}
            onValueChange={(value) => setEditedData({ ...editedData, status: value as Application['status'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="To Apply">To Apply</SelectItem>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Offer">Offer</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditedData(application);
                setIsEditing(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{application.company_name}</TableCell>
      <TableCell>{application.position}</TableCell>
      <TableCell>{application.location}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {format(new Date(application.application_date), 'MMM d, yyyy')}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`${getStatusColor(application.status)} text-white`}>
          {application.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClone}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(application.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ApplicationRow;