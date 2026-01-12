import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BookOpen, Award, Clock, GraduationCap } from 'lucide-react';

const SplashScreen = ({ isLoading = true }: { isLoading?: boolean }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [currentState, setCurrentState] = useState(0);

  // Loading states with icons and colors
  const loadingStates = [
    {
      text: 'Preparing your exam environment',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'from-green-600 to-emerald-500'
    },
    {
      text: 'Loading exam materials',
      icon: <Award className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-400'
    },
    {
      text: 'Securing your connection',
      icon: <Clock className="w-5 h-5" />,
      color: 'from-emerald-500 to-green-400'
    },
    {
      text: 'Finalizing setup',
      icon: <GraduationCap className="w-5 h-5" />,
      color: 'from-green-600 to-emerald-500'
    }
  ];

  // Simulate loading progress
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 - prev) * 0.05, 100));
    }, 100);

    const stateInterval = setInterval(() => {
      setCurrentState(prev => (prev + 1) % loadingStates.length);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(stateInterval);
    };
  }, [isLoading, loadingStates.length]);

  if (!isVisible) return null;

  const current = loadingStates[currentState];

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Gradient Corners */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-green-500/20 to-transparent rounded-br-full" />
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-green-500/20 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-green-500/20 to-transparent rounded-tr-full" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-green-500/20 to-transparent rounded-tl-full" />
        <div className="relative w-full max-w-md px-6">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-10 dark:opacity-5">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-green-500"
                style={{
                  width: Math.random() * 200 + 100 + 'px',
                  height: Math.random() * 200 + 100 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  opacity: 0.05 + Math.random() * 0.05
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 20],
                  y: [0, (Math.random() - 0.5) * 20],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 15 + Math.random() * 15,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'linear'
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            {/* Logo Container */}
            <motion.div 
              className="mx-auto mb-8 w-32 h-32 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-1 shadow-lg"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6,
                type: 'spring',
                damping: 10,
                stiffness: 100
              }}
            >
              <div className="flex items-center justify-center h-full w-full">
                <img 
                  src="/logo.png" 
                  alt="Elyon" 
                  className="h-20 w-20 object-contain"
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1 
              className="text-4xl font-bold text-center mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Elyon Examination
            </motion.h1>

            <motion.p 
              className="text-center text-gray-600 dark:text-gray-300 mb-8 text-lg"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 0.8 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Your Gateway to Academic Excellence
            </motion.p>

            {/* Loading State */}
            <div className="space-y-6">
              {/* Loading Message */}
              <motion.div 
                className="flex items-center justify-center space-x-3 text-gray-700 dark:text-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className={`p-2 rounded-lg bg-gradient-to-br ${current.color} shadow-md`}
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {current.icon}
                </motion.div>
                <span className="text-lg font-medium">{current.text}...</span>
              </motion.div>

              {/* Progress Bar */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full bg-gradient-to-r ${current.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="text-center text-sm text-gray-400">
                  Loading... {Math.round(progress)}%
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div 
              className="mt-10 text-center text-xs text-gray-400 dark:text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.8 }}
            >
              <p> {new Date().getFullYear()} Elyon Examination</p>
              <p className="mt-1 text-[11px]">Precision in Assessment, Excellence in Education</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;