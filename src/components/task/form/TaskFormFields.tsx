import React from "react";
import TaskBasicFields from "./TaskBasicFields";
import TaskDateFields from "./TaskDateFields";
import TaskMetadataFields from "./TaskMetadataFields";
import TaskInsightsField from "./TaskInsightsField";

interface TaskFormFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, field?: string) => void;
}

const TaskFormFields = ({ formData, handleChange }: TaskFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <TaskBasicFields formData={formData} handleChange={handleChange} />
        <TaskDateFields formData={formData} handleChange={handleChange} />
      </div>
      
      <div className="space-y-6">
        <TaskMetadataFields formData={formData} handleChange={handleChange} />
        <TaskInsightsField formData={formData} handleChange={handleChange} />
      </div>
    </div>
  );
};

export default TaskFormFields;