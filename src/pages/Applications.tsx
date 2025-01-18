import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/application";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import ApplicationForm from "@/components/applications/ApplicationForm";
import ApplicationRow from "@/components/applications/ApplicationRow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const { toast } = useToast();
  const { currentDashboard } = useDashboard();

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id);

      if (currentDashboard) {
        query = query.eq('dashboard_id', currentDashboard.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data as Application[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        () => {
          console.log('Applications changed, refreshing...');
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDashboard?.id]);

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    }
  };

  const handleClone = async (applicationToClone: Application) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create a new application object without the id
      const { id, created_at, updated_at, ...cloneData } = applicationToClone;
      
      const newApplication = {
        ...cloneData,
        company_name: `${applicationToClone.company_name} (Copy)`,
        application_date: new Date().toISOString().split('T')[0],
        status: "To Apply" as const,
        user_id: user.id,
        dashboard_id: currentDashboard?.id || null,
      };

      const { error } = await supabase
        .from('applications')
        .insert([newApplication]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application cloned successfully",
      });
      fetchApplications();
    } catch (error) {
      console.error('Error cloning application:', error);
      toast({
        title: "Error",
        description: "Failed to clone application",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Application['status']) => {
    const colors = {
      'To Apply': 'bg-gray-500',
      'Applied': 'bg-blue-500',
      'Interview': 'bg-yellow-500',
      'Offer': 'bg-green-500',
      'Rejected': 'bg-red-500',
      'Withdrawn': 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Button onClick={() => {
          setSelectedApplication(null);
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <ApplicationRow
                key={app.id}
                application={app}
                onDelete={handleDelete}
                onEdit={(updatedApp) => {
                  const updatedApps = applications.map(a => 
                    a.id === updatedApp.id ? updatedApp : a
                  );
                  setApplications(updatedApps);
                }}
                onClone={handleClone}
                getStatusColor={getStatusColor}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedApplication ? 'Edit Application' : 'Add Application'}
            </DialogTitle>
          </DialogHeader>
          <ApplicationForm
            initialData={selectedApplication}
            onSubmit={() => {
              setIsFormOpen(false);
              fetchApplications();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;