import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthStateHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Checking auth session:", session);
        
        if (error) {
          console.error("Auth session error:", error);
          // Clear any stale session data
          await supabase.auth.signOut();
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
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate("/auth");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      }

      if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to auth");
        // Clear any local session data
        localStorage.removeItem('supabase.auth.token');
        navigate("/auth");
      }

      // Handle session expiration
      if (!session) {
        console.log("Session expired or invalid");
        toast({
          title: "Session Expired",
          description: "Please sign in again",
          variant: "destructive",
        });
        await supabase.auth.signOut();
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