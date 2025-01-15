import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthStateHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Checking auth session:", session);
      
      if (error) {
        console.error("Auth session error:", error);
        toast({
          title: "Session Error",
          description: "Please sign in again",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      if (!session) {
        console.log("No active session, redirecting to auth");
        navigate("/auth");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      }

      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to auth");
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return null;
};

export default AuthStateHandler;