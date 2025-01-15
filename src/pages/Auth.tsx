import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/layout/Header";
import { AuthError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in Auth component:", event, !!session);
      
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      }
      // Clear error message when user signs out
      if (event === "SIGNED_OUT") {
        setErrorMessage("");
      }
      // Handle authentication errors
      if (event === "USER_UPDATED") {
        supabase.auth.getSession().then(({ error }) => {
          if (error) {
            setErrorMessage(getErrorMessage(error));
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    switch (error.message) {
      case "Invalid login credentials":
        return "Invalid email or password. Please check your credentials and try again.";
      case "Email not confirmed":
        return "Please verify your email address before signing in.";
      default:
        return error.message;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      <div className="container flex items-center justify-center min-h-screen py-20 px-4">
        <Card className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm shadow-xl animate-scale">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-primary">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <SupabaseAuth 
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#1E293B',
                      brandAccent: '#334155',
                    },
                  },
                },
                className: {
                  container: 'animate-fade-in',
                  button: 'bg-primary hover:bg-primary/90',
                  label: 'text-sm font-medium text-gray-700',
                  input: 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                },
              }}
              providers={[]}
              view="sign_in"
              showLinks={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;