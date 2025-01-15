import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { extractDomainFromCompany } from '@/utils/companyUtils';

interface Dashboard {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  company_name?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  logo_url?: string;
}

interface DashboardContextType {
  currentDashboard: Dashboard | null;
  dashboards: Dashboard[];
  setCurrentDashboard: (dashboard: Dashboard) => void;
  createDashboard: (data: Partial<Dashboard>) => Promise<void>;
  renameDashboard: (id: number, name: string) => Promise<void>;
  deleteDashboard: (id: number) => Promise<void>;
  updateDashboard: (id: number, data: Partial<Dashboard>) => Promise<void>;
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

    // Set up real-time subscription
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dashboards'
        },
        () => {
          console.log('Dashboard changes detected, refreshing...');
          fetchDashboards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const createDashboard = async (data: Partial<Dashboard>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let logoUrl = data.logo_url;
      if (data.company_name && !logoUrl) {
        const domain = extractDomainFromCompany(data.company_name);
        logoUrl = `https://logo.clearbit.com/${domain}`;
      }

      const { data: newDashboard, error } = await supabase
        .from('dashboards')
        .insert([{ 
          ...data,
          user_id: user.id,
          logo_url: logoUrl
        }])
        .select()
        .single();

      if (error) throw error;

      setDashboards(prev => [...prev, newDashboard]);
      toast({
        title: "Success",
        description: "Dashboard created successfully",
      });
      
      // Set as current if it's the first dashboard
      if (dashboards.length === 0) {
        setCurrentDashboard(newDashboard);
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

  const updateDashboard = async (id: number, data: Partial<Dashboard>) => {
    try {
      let updateData = { ...data };
      
      if (data.company_name && !data.logo_url) {
        const domain = extractDomainFromCompany(data.company_name);
        updateData.logo_url = `https://logo.clearbit.com/${domain}`;
      }

      const { data: updatedDashboard, error } = await supabase
        .from('dashboards')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDashboards(prev => prev.map(d => d.id === id ? updatedDashboard : d));
      if (currentDashboard?.id === id) {
        setCurrentDashboard(updatedDashboard);
      }

      toast({
        title: "Success",
        description: "Dashboard updated successfully",
      });
    } catch (error) {
      console.error('Error updating dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to update dashboard",
        variant: "destructive",
      });
    }
  };

  const renameDashboard = async (id: number, name: string) => {
    return updateDashboard(id, { name });
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
        updateDashboard,
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