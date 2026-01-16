import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import { Loader2, LogIn, Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

const Index = () => {
  // State hooks
  const [admissionId, setAdmissionId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  
  // Refs
  const tapTimeout = useRef<number | null>(null);
  
  // Context hooks
  const { login, isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();


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

    setIsSubmitting(true);
    
    try {
      const result = await login(admissionId, password);
      
      if (result.success) {
        toast({
          title: 'Welcome!',
          description: 'Login successful. Redirecting to dashboard...',
        });
        // Navigation is handled by the useEffect hook
      } else {
        toast({
          title: 'Login Failed',
          description: result.error || 'Invalid Admission ID or Password. Please try again.',
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
      setIsSubmitting(false);
    }
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

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
    };
  }, []);
  
  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
                disabled={isSubmitting}
                placeholder="Enter your admission ID"
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
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
                  disabled={isSubmitting}
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

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-xl font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </>
                )}
              </button>
              
              <Link 
                to="/forgot-id" 
                className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200 focus:ring-offset-2 transition-all duration-200 border border-green-100 text-sm"
              >
                Forgot ID?
              </Link>
            </div>
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