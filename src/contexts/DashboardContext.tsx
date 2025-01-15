import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Dashboard {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface DashboardContextType {
  currentDashboard: Dashboard | null;
  dashboards: Dashboard[];
  setCurrentDashboard: (dashboard: Dashboard) => void;
  createDashboard: (name: string) => Promise<void>;
  renameDashboard: (id: number, name: string) => Promise<void>;
  deleteDashboard: (id: number) => Promise<void>;
  isLoading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setDashboards(data || []);
      
      // Set first dashboard as current if none selected
      if (!currentDashboard && data && data.length > 0) {
        setCurrentDashboard(data[0]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboards",
        variant: "destructive",
      });
    }
  };

  const createDashboard = async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('dashboards')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setDashboards(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Dashboard created successfully",
      });
      
      // Set as current if it's the first dashboard
      if (dashboards.length === 0) {
        setCurrentDashboard(data);
      }
    } catch (error) {
      console.error('Error creating dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to create dashboard",
        variant: "destructive",
      });
    }
  };

  const renameDashboard = async (id: number, name: string) => {
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDashboards(prev => prev.map(d => d.id === id ? data : d));
      if (currentDashboard?.id === id) {
        setCurrentDashboard(data);
      }
      
      toast({
        title: "Success",
        description: "Dashboard renamed successfully",
      });
    } catch (error) {
      console.error('Error renaming dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to rename dashboard",
        variant: "destructive",
      });
    }
  };

  const deleteDashboard = async (id: number) => {
    try {
      if (dashboards.length <= 1) {
        toast({
          title: "Error",
          description: "Cannot delete the last dashboard",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDashboards(prev => prev.filter(d => d.id !== id));
      
      // If current dashboard was deleted, switch to first available
      if (currentDashboard?.id === id) {
        const remainingDashboards = dashboards.filter(d => d.id !== id);
        setCurrentDashboard(remainingDashboards[0]);
      }

      toast({
        title: "Success",
        description: "Dashboard deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to delete dashboard",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        currentDashboard,
        dashboards,
        setCurrentDashboard,
        createDashboard,
        renameDashboard,
        deleteDashboard,
        isLoading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};