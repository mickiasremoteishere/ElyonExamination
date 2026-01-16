// src/pages/AdminLogin.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import logo from '@/assets/logo.png';

const AdminLogin = () => {
  useDocumentTitle('Admin Login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuperadminMode, setIsSuperadminMode] = useState(false);
  const { login, isAuthenticated, admin } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Check for superadmin parameter in URL
  useEffect(() => {
    const superadminParam = searchParams.get('superadmin');
    if (superadminParam === 'true') {
      setIsSuperadminMode(true);
      toast({
        title: 'Superadmin Mode',
        description: 'You are accessing the superadmin login.',
        variant: 'default',
      });
    }
  }, [searchParams]);

  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, admin });
    if (isAuthenticated) {
      console.log('Redirecting to dashboard...');
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate, admin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted', { username });
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: 'Missing Credentials',
        description: 'Please enter both username and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      console.log('Login result:', success);
      
      if (success) {
        toast({
          title: 'Welcome Admin!',
          description: 'Login successful. Redirecting to dashboard...',
        });
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Rendering AdminLogin', { isAuthenticated, admin });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
        <div>Auth State: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
        {admin && <div>User: {admin.username} ({admin.role})</div>}
      </div>
      
      <div className="w-full max-w-md relative">
        <div className="bg-card border border-border rounded-2xl shadow-elevated p-8 animate-scale-in">
          <div className="flex flex-col items-center mb-8">
            <div className={`p-4 rounded-2xl mb-4 animate-fade-in ${isSuperadminMode ? 'bg-destructive/20' : 'bg-primary'}`}>
              <Shield className={`h-12 w-12 ${isSuperadminMode ? 'text-destructive' : 'text-primary-foreground'}`} />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {isSuperadminMode ? 'Superadmin Portal' : 'Admin Portal'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1 text-center">
              {isSuperadminMode 
                ? 'Superuser access to manage system settings and users' 
                : 'Sign in to manage exams & students'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;