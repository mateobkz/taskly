import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/contexts/DashboardContext";

interface ApplicationFormProps {
  initialData?: Application | null;
  onSubmit: () => void;
}

const ApplicationForm = ({ initialData, onSubmit }: ApplicationFormProps) => {
  const [formData, setFormData] = useState<Partial<Application>>(
    initialData || {
      company_name: "",
      position: "",
      location: "",
      application_date: new Date().toISOString().split('T')[0],
      status: "To Apply",
      application_url: "",
      notes: "",
      contact_person: "",
      next_step: "",
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { currentDashboard } = useDashboard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const applicationData = {
        ...formData,
        user_id: user.id,
        dashboard_id: currentDashboard?.id || null,
      };

      if (initialData) {
        const { error } = await supabase
          .from('applications')
          .update(applicationData)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('applications')
          .insert([applicationData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Application ${initialData ? 'updated' : 'added'} successfully`,
      });
      onSubmit();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: `Failed to ${initialData ? 'update' : 'add'} application`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={formData.company_name || ""}
            onChange={(e) =>
              setFormData({ ...formData, company_name: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={formData.position || ""}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location || ""}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="application_date">Application Date</Label>
          <Input
            id="application_date"
            type="date"
            value={formData.application_date?.split('T')[0] || ""}
            onChange={(e) =>
              setFormData({ ...formData, application_date: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status || "To Apply"}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value as Application['status'] })
            }
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="application_url">Application URL</Label>
          <Input
            id="application_url"
            type="url"
            value={formData.application_url || ""}
            onChange={(e) =>
              setFormData({ ...formData, application_url: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person || ""}
            onChange={(e) =>
              setFormData({ ...formData, contact_person: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="next_step">Next Step</Label>
          <Input
            id="next_step"
            value={formData.next_step || ""}
            onChange={(e) =>
              setFormData({ ...formData, next_step: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {initialData ? 'Update' : 'Add'} Application
        </Button>
      </div>
    </form>
  );
};

export default ApplicationForm;