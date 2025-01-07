import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookType } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(167,139,250,0.05)_50%,transparent_75%)] bg-[length:20px_20px] animate-gradient-shift"></div>
      </div>

      {/* Logo and title */}
      <div className="relative flex flex-col items-center mb-12 animate-fade-in">
        <div className="p-4 bg-gradient-to-br from-accent to-secondary rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-accent/20">
          <BookType className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight gradient-text">Task Tracker</h1>
        <p className="text-base text-white/80">Professional Task Management</p>
      </div>
      
      {/* Auth card */}
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl animate-scale">
        <CardHeader className="space-y-2">
          <CardTitle className="text-center text-2xl font-medium text-white">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-6 bg-destructive/5 border border-destructive/10">
              <AlertDescription className="text-destructive">{errorMessage}</AlertDescription>
            </Alert>
          )}
          <SupabaseAuth 
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#A78BFA',
                    brandAccent: '#8B5CF6',
                    inputBackground: 'rgba(255, 255, 255, 0.05)',
                    inputText: '#F8FAFC',
                    inputPlaceholder: 'rgba(248, 250, 252, 0.4)',
                  },
                },
              },
              className: {
                container: 'animate-fade-in space-y-4',
                button: 'bg-gradient-to-r from-accent to-accent-600 hover:from-accent-500 hover:to-accent-700 text-white border-0 transition-all duration-200 hover:shadow-lg hover:shadow-accent/20',
                label: 'text-sm font-medium text-white/90',
                input: 'mt-1 block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 shadow-sm focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-200',
                loader: 'text-white',
                anchor: 'text-accent hover:text-accent-400 transition-colors duration-200',
              },
            }}
            providers={[]}
            view="sign_in"
            showLinks={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;