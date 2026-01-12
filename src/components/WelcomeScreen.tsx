import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Clock, Award, ChevronRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import SplashScreen from './SplashScreen';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setIsMounted(true);
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Ethiopian Curriculum",
      description: "Practice with quizzes based on the Ethiopian education curriculum.",
      color: "from-green-500 to-green-400"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Timed Practice",
      description: "Simulate real exam conditions with our timed quiz feature.",
      color: "from-green-600 to-green-500"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Instant Feedback",
      description: "Get immediate results and explanations for each question.",
      color: "from-green-700 to-green-600"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Track Progress",
      description: "Monitor your improvement across different subjects and topics.",
      color: "from-green-800 to-green-700"
    }
  ];

  const benefits = [
    "100% Free Access",
    "Ethiopian Curriculum Based",
    "No Registration Required",
    "Practice Anytime, Anywhere"
  ];

  // Check for mobile and handle SSR
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Set initial mobile state
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50"
          >
            <SplashScreen isLoading={true} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative ${showSplash ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}>

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 relative">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={isMounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center mb-12 md:mb-20 px-2"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isMounted ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6"
          >
            Ethiopian Education Platform
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2">
            Excel in Your <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">National Exams</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
            Practice with free quizzes designed to help Ethiopian students prepare for national examinations with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mt-8 sm:mt-10 w-full max-w-sm sm:max-w-md mx-auto relative z-10">
            <a 
              href="/login" 
              className="inline-flex items-center justify-center h-14 sm:h-16 px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-95"
            >
              Proceed to Login
              <ChevronRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a 
              href="https://elyonregisters.vercel.app/registration" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-14 sm:h-16 px-6 sm:px-8 py-4 text-base sm:text-lg font-medium rounded-xl border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 active:scale-95"
            >
              Register Now
            </a>
          </div>
        </motion.div>

        <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-24 px-2 sm:px-0">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={isMounted ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.4, 
                delay: 0.1 + index * 0.05,
                type: 'spring',
                stiffness: 100
              }}
              whileTap={{ scale: isMobile ? 0.98 : 1 }}
              className="group"
            >
              <Card className="h-full bg-background/80 sm:bg-background/50 backdrop-blur-sm border border-border/30 sm:border-border/50 overflow-hidden transition-all duration-200 active:scale-[0.98] sm:active:scale-100 sm:group-hover:shadow-lg sm:group-hover:border-primary/20">
                <div className={cn("h-1.5 sm:h-2 bg-gradient-to-r", feature.color)} />
                <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4",
                    'bg-green-500/20 text-green-600'
                  )}>
                    {React.cloneElement(feature.icon, { 
                      className: `${feature.icon.props.className} w-4 h-4 sm:w-5 sm:h-5` 
                    })}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 mb-12 sm:mb-16 md:mb-20 border border-border/20 sm:border-border/30 mx-2 sm:mx-0 backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={isMounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Why Use Our Platform?</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8">
              Join thousands of Ethiopian students preparing for their exams with our free practice platform.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
              {benefits.map((benefit, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-start gap-3 bg-background/30 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="text-center px-2 sm:px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={isMounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="max-w-2xl mx-auto bg-background/90 sm:bg-background/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-border/30 shadow-md sm:shadow-lg">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Ready to Practice?</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              Start practicing with our free quizzes and improve your exam performance today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative z-10">
              <a 
                href="/login" 
                className="inline-flex items-center justify-center h-14 sm:h-16 px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-95"
              >
                Proceed to Login
                <ChevronRight className="ml-1.5 h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              
              <a 
                href="https://elyonregisters.vercel.app/registration" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-14 sm:h-16 px-6 sm:px-8 py-4 text-base sm:text-lg font-medium rounded-xl border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 active:scale-95"
              >
                Register Now
              </a>
            </div>
            
            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
              Completely free • No hidden fees • Aligned with Ethiopian curriculum
            </p>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
