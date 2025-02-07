import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Clipboard } from 'lucide-react';

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
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        checkProfileCompletion(session.user.id);
      }

      if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      }

      if (event === 'USER_UPDATED') {
        console.log("User profile updated");
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
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
  }, [navigate, toast]);

  const checkProfileCompletion = async (userId: string) => {
    console.log("Checking profile completion for user:", userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error checking profile:", error);
        throw error;
      }

      if (profile) {
        console.log("Profile found, redirecting to dashboard");
        navigate('/');
      } else {
        console.log("No profile found");
        toast({
          title: "Welcome!",
          description: "Please complete your profile to continue.",
        });
        navigate('/profile');
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Clipboard className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome to Taskly</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <div className="bg-card shadow-sm rounded-lg p-6">
            <SupabaseAuth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--primary))',
                      brandAccent: 'hsl(var(--primary))',
                      inputBackground: 'hsl(var(--background))',
                      inputBorder: 'hsl(var(--border))',
                      inputBorderFocus: 'hsl(var(--ring))',
                      inputBorderHover: 'hsl(var(--border))',
                      inputPlaceholder: 'hsl(var(--muted-foreground))',
                    },
                    borderRadii: {
                      borderRadiusButton: 'var(--radius)',
                      buttonBorderRadius: 'var(--radius)',
                      inputBorderRadius: 'var(--radius)',
                    },
                  },
                },
                className: {
                  container: 'w-full',
                  button: 'w-full px-4 py-2 rounded-md',
                  input: 'w-full px-4 py-2 rounded-md border',
                  label: 'text-sm font-medium text-foreground',
                  message: 'text-sm text-destructive',
                },
              }}
              providers={[]}
              redirectTo={window.location.origin}
            />
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            By signing in, you agree to our{' '}
            <a href="#" className="font-medium text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
      <div className="hidden lg:block relative w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-4">Track Your Learning Journey</h2>
            <p className="text-muted-foreground">
              Welcome to Taskly - your personal task tracking companion. Monitor your progress, 
              celebrate achievements, and grow your skills with our intuitive dashboard and 
              personalized recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;