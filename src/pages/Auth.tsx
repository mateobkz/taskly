import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Auth component mounted");
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Supabase auth event:", event);
      console.log("Session:", session);

      if (event === 'SIGNED_IN' && session) {
        console.log("Auth state changed:", event, session.user.id);
        checkProfileCompletion(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkProfileCompletion(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const checkProfileCompletion = async (userId: string) => {
    console.log("Checking profile completion for user:", userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        console.log("Profile found, redirecting to dashboard");
        navigate('/');
      } else {
        console.log("No profile found");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      toast({
        title: "Error",
        description: "Failed to check profile completion",
        variant: "destructive",
      });
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
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <SupabaseAuth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#1E293B',
                      brandAccent: '#3B82F6',
                    },
                  },
                },
                className: {
                  container: 'w-full',
                  button: 'w-full px-4 py-2 rounded-md',
                  input: 'w-full px-4 py-2 rounded-md border border-gray-300',
                },
              }}
              providers={[]}
              redirectTo={window.location.origin}
            />
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/og-image.png"
          alt="Learning dashboard background"
        />
      </div>
    </div>
  );
};

export default Auth;