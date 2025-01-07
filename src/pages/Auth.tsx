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
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1F2C] via-[#2C3444] to-[#1A1F2C] py-12 px-4 sm:px-6 lg:px-8">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(155,135,245,0.05)_50%,transparent_75%)] bg-[length:20px_20px] animate-[pulse_8s_linear_infinite]"></div>
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center mb-12 animate-fade-in">
        <div className="p-4 bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-all duration-300">
          <BookType className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Task Tracker</h1>
        <p className="text-base text-[#C8C8C9]">Professional Task Management</p>
      </div>
      
      <Card className="w-full max-w-md bg-[#221F26]/40 backdrop-blur-md border-[#403E43]/20 shadow-2xl animate-scale">
        <CardHeader className="space-y-2">
          <CardTitle className="text-center text-2xl font-medium text-white">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-6 bg-red-500/5 border border-red-500/10">
              <AlertDescription className="text-red-200">{errorMessage}</AlertDescription>
            </Alert>
          )}
          <SupabaseAuth 
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#9b87f5',
                    brandAccent: '#7E69AB',
                    inputBackground: 'rgba(255, 255, 255, 0.05)',
                    inputText: '#E5DEFF',
                    inputPlaceholder: 'rgba(229, 222, 255, 0.4)',
                  },
                },
              },
              className: {
                container: 'animate-fade-in space-y-4',
                button: 'bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 text-white border-0 transition-all duration-200',
                label: 'text-sm font-medium text-[#E5DEFF]',
                input: 'mt-1 block w-full rounded-lg border border-[#403E43] bg-[#221F26]/60 px-3 py-2 text-[#E5DEFF] placeholder-[#E5DEFF]/40 shadow-sm focus:border-[#9b87f5] focus:ring-1 focus:ring-[#9b87f5] transition-all duration-200',
                loader: 'text-[#E5DEFF]',
                anchor: 'text-[#9b87f5] hover:text-[#7E69AB] transition-colors duration-200',
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