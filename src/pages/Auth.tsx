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
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { extractDomainFromCompany, getCompanyLogo } from "@/utils/companyUtils";
import { Upload } from "lucide-react";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep = 'auth' | 'profile' | 'dashboard';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    position: "",
  });
  const [dashboardData, setDashboardData] = useState({
    name: "",
    company_name: "",
    position: "",
    start_date: "",
    end_date: "",
    logo_url: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const checkProfileCompletion = async (userId: string) => {
    console.log("Checking profile completion for user:", userId);
    try {
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
    } catch (error) {
      console.error("Error in checkProfileCompletion:", error);
      return false;
    }
  };

  const checkDashboardExists = async (userId: string) => {
    try {
      const { data: dashboards, error } = await supabase
        .from('dashboards')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error("Error checking dashboards:", error);
        return false;
      }

      return dashboards && dashboards.length > 0;
    } catch (error) {
      console.error("Error in checkDashboardExists:", error);
      return false;
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("User not found");
        return;
      }

      const domain = extractDomainFromCompany(profileData.company);
      const logoUrl = getCompanyLogo(domain);

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
      
      setOnboardingStep('dashboard');
      setDashboardData(prev => ({
        ...prev,
        name: `${profileData.company} Experience`,
        company_name: profileData.company,
        position: profileData.position,
      }));
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("User not found");
        return;
      }

      let logoUrl = dashboardData.logo_url;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, logoFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(filePath);
          logoUrl = publicUrl;
        }
      }

      const { error: dashboardError } = await supabase
        .from('dashboards')
        .insert({
          user_id: user.id,
          name: dashboardData.name,
          company_name: dashboardData.company_name,
          position: dashboardData.position,
          logo_url: logoUrl,
        });

      if (dashboardError) {
        console.error("Dashboard creation error:", dashboardError);
        throw dashboardError;
      }
      
      toast({
        title: "Success",
        description: "Dashboard created successfully",
      });

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error creating dashboard:", error);
      setErrorMessage("Failed to create dashboard. Please try again.");
      toast({
        title: "Error",
        description: "Failed to create dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Auth component mounted");
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        if (session?.user) {
          const hasCompletedProfile = await checkProfileCompletion(session.user.id);
          const hasDashboard = await checkDashboardExists(session.user.id);
          
          if (!hasCompletedProfile) {
            setOnboardingStep('profile');
          } else if (!hasDashboard) {
            setOnboardingStep('dashboard');
          } else {
            navigate("/", { replace: true });
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const hasCompletedProfile = await checkProfileCompletion(session.user.id);
          const hasDashboard = await checkDashboardExists(session.user.id);
          
          if (!hasCompletedProfile) {
            setOnboardingStep('profile');
          } else if (!hasDashboard) {
            setOnboardingStep('dashboard');
          } else {
            navigate("/", { replace: true });
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
          if (error instanceof AuthApiError) {
            setErrorMessage(getErrorMessage(error));
          } else if (error instanceof Error) {
            setErrorMessage(error.message);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setErrorMessage("");
        setOnboardingStep('auth');
      }
    });

    return () => {
      console.log("Cleaning up auth subscriptions");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    console.error("Auth error:", error);
    if (error instanceof AuthApiError) {
      switch (error.message) {
        case "Invalid login credentials":
          return "Invalid email or password. Please check your credentials and try again.";
        case "Email not confirmed":
          return "Please verify your email address before signing in.";
        default:
          return error.message;
      }
    }
    return error.message;
  };

  if (onboardingStep === 'auth') {
    return (
      <DashboardProvider>
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
                  redirectTo={`${window.location.origin}/dashboard`}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardProvider>
    );
  }

  if (onboardingStep === 'profile') {
    return (
      <DashboardProvider>
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
                    Continue
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardProvider>
    );
  }

  if (onboardingStep === 'dashboard') {
    return (
      <DashboardProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
          <Header />
          <div className="container flex items-center justify-center min-h-screen py-20 px-4">
            <Card className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm shadow-xl animate-scale">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-primary">
                  Create Your First Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDashboardSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dashboard Name</label>
                    <Input
                      required
                      value={dashboardData.name}
                      onChange={(e) => setDashboardData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Experience at Company"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <Input
                      value={dashboardData.company_name}
                      onChange={(e) => setDashboardData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Company Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Position</label>
                    <Input
                      value={dashboardData.position}
                      onChange={(e) => setDashboardData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Your Role"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Input
                        type="date"
                        value={dashboardData.start_date}
                        onChange={(e) => setDashboardData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        value={dashboardData.end_date}
                        onChange={(e) => setDashboardData(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Logo</label>
                    <div className="flex gap-4">
                      <Input
                        value={dashboardData.logo_url}
                        onChange={(e) => setDashboardData(prev => ({ ...prev, logo_url: e.target.value }))}
                        placeholder="Logo URL"
                        className="flex-1"
                      />
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="logo-upload"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setLogoFile(file);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>
                    {(dashboardData.logo_url || logoFile) && (
                      <div className="mt-2 p-4 border rounded-lg">
                        <img
                          src={logoFile ? URL.createObjectURL(logoFile) : dashboardData.logo_url}
                          alt="Preview"
                          className="h-12 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Create Dashboard & Get Started
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardProvider>
    );
  }

  return (
    <DashboardProvider>
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
                redirectTo={`${window.location.origin}/dashboard`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default Auth;
