import React, { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import { supabase } from '@/integrations/supabase/client';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export default function Index() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company_name, position')
        .eq('id', user.id)
        .single();

      // Show onboarding if profile is incomplete
      setShowOnboarding(!profile?.full_name);
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Dashboard />
      {showOnboarding && <OnboardingFlow />}
    </>
  );
}