import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { AuthError } from "@supabase/supabase-js";
import { extractDomainFromCompany, getCompanyLogo } from "@/utils/companyUtils";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    position: "",
  });

  const checkProfileCompletion = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, company_name, position')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error checking profile:", error);
      return false;
    }

    return !!(profile?.full_name && profile?.company_name && profile?.position);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const domain = extractDomainFromCompany(profileData.company);
      const logoUrl = getCompanyLogo(domain);

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: `${profileData.firstName} ${profileData.lastName}`,
          company_name: profileData.company,
          position: profileData.position
        }
      });

      if (error) throw error;

      // Update the profile with the company logo
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: `${profileData.firstName} ${profileData.lastName}`,
          company_name: profileData.company,
          position: profileData.position,
          company_logo_url: logoUrl
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const hasCompletedProfile = await checkProfileCompletion(session.user.id);
        if (!hasCompletedProfile) {
          setShowProfileForm(true);
        } else {
          navigate("/", { replace: true });
        }
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const hasCompletedProfile = await checkProfileCompletion(session.user.id);
          if (!hasCompletedProfile) {
            setShowProfileForm(true);
          } else {
            navigate("/", { replace: true });
          }
        }
      }
      
      if (event === "SIGNED_OUT") {
        setErrorMessage("");
        setShowProfileForm(false);
      }
      
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

  if (showProfileForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Header />
        <div className="container flex items-center justify-center min-h-screen py-20 px-4">
          <Card className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm shadow-xl animate-scale">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-primary">
                Complete Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input
                      required
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input
                      required
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    required
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full"
                    placeholder="e.g. Google, Microsoft, etc."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Input
                    required
                    value={profileData.position}
                    onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full"
                    placeholder="e.g. Software Engineer, Product Manager, etc."
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                  Complete Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                      brand: '#3B82F6',
                      brandAccent: '#2563EB',
                    },
                  },
                },
                className: {
                  container: 'animate-fade-in',
                  button: 'bg-blue-500 hover:bg-blue-600',
                  label: 'text-sm font-medium text-gray-700',
                  input: 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
                  message: 'text-sm text-red-600',
                  anchor: 'text-sm text-blue-500 hover:text-blue-600',
                },
              }}
              providers={[]}
              view="sign_in"
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email address',
                    password_label: 'Password',
                    button_label: 'Sign in',
                    link_text: 'Already have an account? Sign in',
                  },
                  sign_up: {
                    email_label: 'Email address',
                    password_label: 'Create a password',
                    button_label: 'Create account',
                    link_text: "Don't have an account? Sign up",
                  },
                  forgotten_password: {
                    email_label: 'Email address',
                    button_label: 'Send reset instructions',
                    link_text: 'Forgot your password?',
                  },
                },
              }}
              showLinks={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;