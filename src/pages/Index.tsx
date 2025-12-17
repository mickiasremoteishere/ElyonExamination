import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogIn, Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

const Index = () => {
  const [admissionId, setAdmissionId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const tapTimeout = useRef<number | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!admissionId.trim() || !password.trim()) {
      toast({
        title: 'Missing Credentials',
        description: 'Please enter both Admission ID and Password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    const result = await login(admissionId, password);
    
    if (result.success) {
      toast({
        title: 'Welcome!',
        description: 'Login successful. Redirecting to dashboard...',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Login Failed',
        description: result.error || 'Invalid Admission ID or Password. Please try again.',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  const handleLogoClick = () => {
    // Clear any existing timeout
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }

    // Increment tap count
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // No toast shown for admin access

    // Set timeout to reset tap counter after 3 seconds
    tapTimeout.current = window.setTimeout(() => {
      setTapCount(0);
    }, 3000);

    // If reached 10 taps, navigate to admin login
    if (newTapCount >= 10) {
      setTapCount(0);
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
      navigate('/admin/login');
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-elevated p-8 animate-scale-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8 relative">
            <div 
              className="bg-primary/5 p-4 rounded-2xl mb-4 animate-fade-in relative group cursor-pointer transition-transform active:scale-95"
              onClick={handleLogoClick}
              title=""
            >
              <img src={logo} alt="ElyonExams Logo" className="h-20 w-20 object-contain relative z-10" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Lock size={24} className="text-primary/50" />
              </div>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">ElyonExams Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to access your exams</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <label htmlFor="admissionId" className="text-sm font-medium text-foreground">
                Admission ID
              </label>
              <input
                id="admissionId"
                type="text"
                value={admissionId}
                onChange={(e) => setAdmissionId(e.target.value)}
                placeholder="Enter your Admission ID"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up shadow-soft hover:shadow-glow"
              style={{ animationDelay: '300ms' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>
          
          {/* Website Link */}
          <div className="mt-8 text-center">
            <a 
              href="https://ElyonExamination.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              elyonexamination.vercel.app
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;