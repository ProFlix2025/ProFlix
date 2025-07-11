import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [, setLocation] = useLocation();

  const { data: adminStatus, isLoading, error } = useQuery({
    queryKey: ['/api/admin/status'],
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (!isLoading && (!adminStatus?.isAdmin || error)) {
      // Redirect to admin login if not authenticated
      setLocation('/admin/login');
    }
  }, [adminStatus, isLoading, error, setLocation]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-netflix-gray border-netflix-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-netflix-red animate-pulse" />
            </div>
            <CardTitle className="text-xl font-bold text-white">
              Verifying Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-netflix-red mx-auto mb-4"></div>
            <p className="text-netflix-light-gray">
              Checking authentication status...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-netflix-gray border-netflix-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-xl font-bold text-white">
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-red-900/20 border-red-500/50 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                Unable to verify admin access. Please try logging in again.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => setLocation('/admin/login')}
              className="w-full bg-netflix-red hover:bg-red-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show unauthorized state
  if (!adminStatus?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-netflix-gray border-netflix-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-yellow-500" />
            </div>
            <CardTitle className="text-xl font-bold text-white">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-yellow-900/20 border-yellow-500/50 mb-4">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-400">
                Admin authentication required to access this area.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => setLocation('/admin/login')}
              className="w-full bg-netflix-red hover:bg-red-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show session expiry warning
  if (adminStatus?.authenticated && adminStatus?.expiresAt) {
    const expiresAt = new Date(adminStatus.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));

    if (minutesUntilExpiry < 10 && minutesUntilExpiry > 0) {
      return (
        <div className="min-h-screen bg-black">
          <div className="bg-yellow-900/20 border-b border-yellow-500/50 p-4">
            <Alert className="bg-yellow-900/20 border-yellow-500/50">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-400">
                <strong>Session Warning:</strong> Your admin session will expire in {minutesUntilExpiry} minute{minutesUntilExpiry !== 1 ? 's' : ''}. 
                Any activity will extend your session.
              </AlertDescription>
            </Alert>
          </div>
          {children}
        </div>
      );
    }
  }

  // Render protected content
  return <>{children}</>;
}