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
import ApplicationToolbar from "@/components/applications/ApplicationToolbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JobRecommendations from "@/components/applications/JobRecommendations";

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });
  const [sortField, setSortField] = useState<string>("application_date");
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
      applyFiltersAndSort(data as Application[]);
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

  const applyFiltersAndSort = (data: Application[]) => {
    let filtered = [...data];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(app => 
        app.company_name.toLowerCase().includes(searchLower) ||
        app.position.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortField) {
        case 'company_name':
          return a.company_name.localeCompare(b.company_name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'application_date':
        default:
          return new Date(b.application_date).getTime() - new Date(a.application_date).getTime();
      }
    });

    setFilteredApplications(filtered);
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

  useEffect(() => {
    applyFiltersAndSort(applications);
  }, [filters, sortField, applications]);

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

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .in('id', selectedApplications);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Applications deleted successfully",
      });
      setSelectedApplications([]);
      fetchApplications();
    } catch (error) {
      console.error('Error deleting applications:', error);
      toast({
        title: "Error",
        description: "Failed to delete applications",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusChange = async (status: Application['status']) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .in('id', selectedApplications);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Applications updated successfully",
      });
      setSelectedApplications([]);
      fetchApplications();
    } catch (error) {
      console.error('Error updating applications:', error);
      toast({
        title: "Error",
        description: "Failed to update applications",
        variant: "destructive",
      });
    }
  };

  const handleBulkExport = () => {
    const selectedData = applications.filter(app => selectedApplications.includes(app.id));
    const csv = [
      ['Company', 'Position', 'Location', 'Date', 'Status'].join(','),
      ...selectedData.map(app => [
        app.company_name,
        app.position,
        app.location || '',
        app.application_date,
        app.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'applications.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClone = async (applicationToClone: Application) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { id, created_at, updated_at, ...cloneData } = applicationToClone;
      
      const newApplication = {
        ...cloneData,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ApplicationToolbar
            selectedApplications={selectedApplications}
            onBulkDelete={handleBulkDelete}
            onBulkExport={handleBulkExport}
            onBulkStatusChange={handleBulkStatusChange}
            onFilterChange={(field, value) => setFilters(prev => ({ ...prev, [field]: value }))}
            onSortChange={setSortField}
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
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
                    isSelected={selectedApplications.includes(app.id)}
                    onSelect={(id, selected) => {
                      setSelectedApplications(prev => 
                        selected 
                          ? [...prev, id]
                          : prev.filter(appId => appId !== id)
                      );
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-6">
          <JobRecommendations />
        </div>
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
