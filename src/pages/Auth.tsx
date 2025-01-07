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
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-[#0EA5E9] via-[#8B5CF6] to-[#D946EF] py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[100%] opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8B5CF6] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#D946EF] rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[700px] h-[700px] bg-[#0EA5E9] rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center mb-8 animate-fade-in">
        <div className="p-4 bg-white bg-opacity-10 backdrop-blur-lg rounded-full mb-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
          <BookType className="w-14 h-14 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Task Tracker</h1>
        <p className="text-lg text-white/80">Organize. Track. Achieve.</p>
      </div>
      
      <Card className="w-full max-w-md space-y-8 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl animate-scale">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/20">
              <AlertDescription className="text-white">{errorMessage}</AlertDescription>
            </Alert>
          )}
          <SupabaseAuth 
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(139, 92, 246)',
                    brandAccent: 'rgb(217, 70, 239)',
                    inputBackground: 'rgba(255, 255, 255, 0.1)',
                    inputText: 'white',
                    inputPlaceholder: 'rgba(255, 255, 255, 0.5)',
                  },
                },
              },
              className: {
                container: 'animate-fade-in',
                button: 'bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white border-white/20 transition-all duration-200',
                label: 'text-sm font-medium text-white/80',
                input: 'mt-1 block w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-lg px-3 py-2 text-white placeholder-white/50 shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200',
                loader: 'text-white',
                anchor: 'text-white/80 hover:text-white transition-colors duration-200',
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