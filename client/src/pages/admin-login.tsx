import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, User, AlertTriangle } from 'lucide-react';
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiRequest('POST', '/api/admin/login', {
        username,
        password
      });

      console.log('Login response:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        
        // Clear and refetch admin status to ensure fresh session
        queryClient.invalidateQueries({ queryKey: ['/api/admin/status'] });
        
        // Wait for session to be established, then redirect
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      } else {
        const data = await response.json();
        console.error('Login failed:', data);
        setError(data.error || 'Login failed');
        setAttempts(prev => prev + 1);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Connection error');
      setAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-netflix-gray border-netflix-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-netflix-red" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Admin Access
          </CardTitle>
          <p className="text-netflix-light-gray">
            Secure authentication required
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                <User className="w-4 h-4 inline mr-2" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="bg-netflix-dark-gray border-netflix-border text-white"
                required
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="bg-netflix-dark-gray border-netflix-border text-white"
                required
                autoComplete="current-password"
              />
            </div>
            
            {error && (
              <Alert className="bg-red-900/20 border-red-500/50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {attempts >= 3 && (
              <Alert className="bg-yellow-900/20 border-yellow-500/50">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-400">
                  Multiple failed attempts detected. Access may be temporarily restricted.
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-netflix-red hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Secure Login
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-netflix-light-gray text-sm">
              Authorized personnel only
            </p>
            <p className="text-netflix-light-gray text-xs mt-1">
              All access attempts are logged and monitored
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}