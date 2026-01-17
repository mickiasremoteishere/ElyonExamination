import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import { exams, Question } from '@/data/exams';
import { saveExamResult, hasStudentTakenExam, saveCancelledExam, saveViolation } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { eueeVerbal2021Questions } from '@/data/eueeVerbalReasoning2021';
import { verbalReasoningQuestions } from '@/data/verbalReasoningQuestions';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle,
  Check,
  X,
  Send,
  Book,
  Brain,
  MessageSquare,
  Type,
  CheckCircle,
  Hash
} from 'lucide-react';
import logo from '@/assets/logo.png';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getQuestionType = (questionId: number, examId?: string): string => {
  // For mock exam, return the specific question type
  if (examId === 'mock-2023-12') {
    // Return the question type based on the question ID
    const questionTypes = [
      'Science (planets, chemistry, astronomy)',
      'Geography (capitals, landmarks)',
      'Mathematics (prime numbers)',
      'Art (famous paintings)',
      'Science (planets, chemistry, astronomy)',
      'Technology (programming languages)',
      'Biology (largest mammal)',
      'Geography (capitals, landmarks)',
      'Science (planets, chemistry, astronomy)',
      'Environmental Science (renewable energy)'
    ];
    return questionTypes[questionId - 1] || 'General Knowledge';
  }
  
  const verbalQuestion = verbalReasoningQuestions.find(q => q.id === `v${questionId}`);
  if (!verbalQuestion) return 'Question';
  
  switch(verbalQuestion.type) {
    case 'antonym': return 'Antonym';
    case 'analogy': return 'Analogy';
    case 'synonym': return 'Synonym';
    case 'completion': return 'Sentence Completion';
    case 'comprehension': return 'Reading Comprehension';
    case 'logical': return 'Logical Reasoning';
    default: return 'Question';
  }
};

const getQuestionSection = (questionId: string | number): string => {
  const id = typeof questionId === 'number' ? `v${questionId}` : questionId;
  const question = eueeVerbal2021Questions.find(q => q.id === id);
  if (!question) return 'VERBAL REASONING';
  
  // Return the section from the question object
  return question.section || 'VERBAL REASONING';
};

const getQuestionTypeIcon = (questionId: number) => {
  const verbalQuestion = verbalReasoningQuestions.find(q => q.id === `v${questionId}`);
  if (!verbalQuestion) return <Hash size={14} className="text-muted-foreground" />;
  
  switch(verbalQuestion.type) {
    case 'antonym': return <span className="text-green-600">Antonym</span>;
    case 'analogy': return <Brain size={14} className="text-blue-500" />;
    case 'synonym': return <CheckCircle size={14} className="text-green-500" />;
    case 'completion': return <Type size={14} className="text-purple-500" />;
    case 'comprehension': return <Book size={14} className="text-amber-500" />;
    case 'logical': return <MessageSquare size={14} className="text-cyan-500" />;
    default: return <Hash size={14} className="text-muted-foreground" />;
  }
};

const Exam = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, student } = useAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);

  const exam = exams.find((e) => e.id === id);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(exam ? exam.duration * 60 : 0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassage, setShowPassage] = useState(true);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [violationCount, setViolationCount] = useState(0);
  const [showCopyWarning, setShowCopyWarning] = useState(false);
  const [copyPasteViolations, setCopyPasteViolations] = useState(0);
  const examStartTime = useRef<number | null>(null);
  
  // Helper function to get violation severity
  const getViolationSeverity = (count: number): 'low' | 'medium' | 'high' => {
    if (count >= 7) return 'high';
    if (count >= 3) return 'medium';
    return 'low';
  };

  // Handle all types of violations
  const handleViolation = useCallback(async (type: 'tab_switch' | 'copy_attempt' | 'paste_attempt' | 'fullscreen_exit' | 'suspicious_activity', description: string) => {
    if (!exam || !student) return;

    // Calculate the new violation count based on type
    const currentViolations = type === 'tab_switch' ? tabSwitchCount : copyPasteViolations;
    const newCount = currentViolations + 1;
    const maxViolations = 10;

    try {
      // Save the violation to the database
      await saveViolation({
        student_id: student.id,
        student_name: student.name || 'Unknown Student',
        admission_id: student.admission_id || 'N/A',
        exam_id: exam.id,
        exam_title: exam.title,
        type,
        description: `${description} (${newCount}/${maxViolations})`,
        severity: getViolationSeverity(newCount),
      });

      // Update the appropriate state based on violation type
      if (type === 'tab_switch') {
        setTabSwitchCount(newCount);
        setShowTabSwitchWarning(true);
        // Hide warning after 10 seconds
        setTimeout(() => setShowTabSwitchWarning(false), 10000);
      } else {
        setCopyPasteViolations(newCount);
        setShowCopyWarning(true);
        // Hide warning after 10 seconds
        setTimeout(() => setShowCopyWarning(false), 10000);
      }

      // Check if we've reached the maximum number of violations
      if (newCount >= maxViolations) {
        const violationType = type === 'tab_switch' ? 'tab switches' : 'copy/paste attempts';
        await handleExamCancellation(`Exceeded maximum allowed ${violationType} (${maxViolations})`);
      }
    } catch (error) {
      console.error('Failed to process violation:', error);
    }
  }, [exam, student, tabSwitchCount, copyPasteViolations]);

  // Check if exam can be taken
  useEffect(() => {
    const checkExamStatus = async () => {
      if (!isAuthenticated) {
        navigate('/', { state: { from: location.pathname } });
        return;
      }

      if (!exam) {
        toast({
          title: 'Exam not found',
          description: 'The requested exam could not be found.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      try {
        // Check if exam is already taken
        const taken = await hasStudentTakenExam(student!.id, exam.id);
        if (taken) {
          toast({
            title: 'Exam already taken',
            description: 'You have already completed this exam.',
            variant: 'default',
          });
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking exam status:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while checking the exam status.',
          variant: 'destructive',
        });
        navigate('/dashboard');
      } finally {
        setIsChecking(false);
      }
    };

    checkExamStatus();
  }, [isAuthenticated, navigate, exam, student, location.pathname, toast]);

  // Handle exam cancellation due to violations
  const handleExamCancellation = useCallback(async (reason: string) => {
    if (!exam || !student) return;
    
    try {
      // Save cancelled exam with 0 score
      await saveCancelledExam(
        student.id,
        student.name,
        exam.id,
        exam.title
      );
      
      // Redirect to exam cancelled page
      navigate('/exam-cancelled', { 
        state: { 
          reason: `Exam cancelled due to: ${reason}`,
          examId: exam.id,
          examTitle: exam.title
        },
        replace: true 
      });
    } catch (error) {
      console.error('Error cancelling exam:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while processing your exam.',
        variant: 'destructive',
      });
    }
  }, [exam, student, navigate, toast]);

  // Generate a unique watermark ID for this exam session
  const watermarkId = useRef(`exam-${student?.id || 'user'}-${Date.now()}-${uuidv4().substring(0, 8)}`);

  // Add watermark to prevent useful screenshots
  useEffect(() => {
    if (isSubmitted) return;

    const createWatermark = () => {
      // Create watermark container
      const watermark = document.createElement('div');
      watermark.id = 'exam-watermark';
      
      // Add student info to watermark
      const studentInfo = student ? `Student: ${student.name || 'Unknown'} (ID: ${student.id})` : 'Unauthorized User';
      const examInfo = exam ? `Exam: ${exam.title} (${exam.id})` : 'Exam Session';
      const timestamp = new Date().toISOString();
      
      // Create watermark text with student and exam info
      const watermarkText = `${studentInfo} | ${examInfo} | ${timestamp} | ${watermarkId.current}`;
      
      // Create multiple watermarks for better coverage
      for (let i = 0; i < 50; i++) {
        const span = document.createElement('div');
        span.textContent = watermarkText;
        span.style.position = 'fixed';
        span.style.pointerEvents = 'none';
        span.style.opacity = '0.1';
        span.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
        span.style.fontSize = '14px';
        span.style.whiteSpace = 'nowrap';
        span.style.color = 'red';
        span.style.zIndex = '9999';
        
        // Position watermarks randomly on the screen
        span.style.left = `${Math.random() * 100}%`;
        span.style.top = `${Math.random() * 100}%`;
        
        // Add some variation to make it harder to remove
        if (i % 3 === 0) span.style.fontWeight = 'bold';
        if (i % 5 === 0) span.style.textDecoration = 'underline';
        
        watermark.appendChild(span);
      }
      
      // Make it hard to inspect/remove the watermark
      Object.defineProperty(watermark, 'innerHTML', {
        get: () => 'Exam content protected',
        set: () => {}
      });
      
      document.body.appendChild(watermark);
      
      // Periodically change watermark positions to make it harder to remove
      const moveWatermark = () => {
        const watermarks = document.querySelectorAll('#exam-watermark > div');
        watermarks.forEach(span => {
          if (Math.random() > 0.7) { // Only move some watermarks at a time
            (span as HTMLElement).style.left = `${Math.random() * 100}%`;
            (span as HTMLElement).style.top = `${Math.random() * 100}%`;
          }
        });
      };
      
      const interval = setInterval(moveWatermark, 5000);
      
      return () => {
        clearInterval(interval);
        if (document.body.contains(watermark)) {
          document.body.removeChild(watermark);
        }
      };
    };
    
    const cleanup = createWatermark();
    
    return () => {
      if (cleanup) cleanup();
      const existingWatermark = document.getElementById('exam-watermark');
      if (existingWatermark && document.body.contains(existingWatermark)) {
        document.body.removeChild(existingWatermark);
      }
    };
  }, [isSubmitted, exam, student]);

  // Screenshot detection and prevention
  // Track previous window dimensions for mobile screenshot detection
  const prevDimensions = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.orientation || 0
  });

  // Show warning when screenshot is detected
  const showScreenshotWarning = useCallback((message = 'Screenshot detected! This action has been logged.') => {
    const warning = document.createElement('div');
    warning.textContent = `⚠️ ${message}`;
    warning.style.position = 'fixed';
    warning.style.top = '20px';
    warning.style.left = '50%';
    warning.style.transform = 'translateX(-50%)';
    warning.style.backgroundColor = 'red';
    warning.style.color = 'white';
    warning.style.padding = '10px 20px';
    warning.style.borderRadius = '5px';
    warning.style.zIndex = '9999';
    warning.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    
    document.body.appendChild(warning);
    
    // Remove warning after 3 seconds
    setTimeout(() => {
      if (document.body.contains(warning)) {
        document.body.removeChild(warning);
      }
    }, 3000);
  }, []);

  useEffect(() => {
    if (isSubmitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect Windows (Win + Shift + S) or Mac (Cmd + Shift + 4/5/3)
      const isScreenshotShortcut = 
        (e.key.toLowerCase() === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) ||
        ((e.key === '4' || e.key === '5' || e.key === '3') && e.shiftKey && e.metaKey) ||
        (e.key === 'PrintScreen') ||
        (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J'));
      
      if (isScreenshotShortcut) {
        e.preventDefault();
        showScreenshotWarning();
        handleViolation('suspicious_activity', `Attempted to take a screenshot using ${e.key} key combination`);
      }
    };

    // Add event listeners for screenshot detection
    window.addEventListener('keydown', handleKeyDown, true);
    
    // Add visual feedback if user tries to take a screenshot
    const handleContextMenu = (e: MouseEvent) => {
      if (e.shiftKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        showScreenshotWarning();
        handleViolation('suspicious_activity', 'Attempted to take a screenshot via context menu');
        return false;
      }
    };

    // Add event listeners for right-click menu and clipboard
    document.addEventListener('contextmenu', handleContextMenu, true);

    // Mutation observer for detecting screenshot tools
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          const screenshotApp = Array.from(mutation.addedNodes).some(node => {
            const element = node as HTMLElement;
            return element.id?.includes('screenshot') || 
                   element.className?.includes('screenshot') ||
                   element.style?.position === 'fixed' && element.style.zIndex === '999999';
          });
          
          if (screenshotApp) {
            showScreenshotWarning('Suspected screenshot tool detected!');
            handleViolation('suspicious_activity', 'Suspected screenshot tool detected');
          }
        }
      }
    });

    // Detect mobile screenshot by checking for resize events that might indicate a screenshot
    const checkForScreenshot = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const currentOrientation = window.orientation || 0;
      
      // If orientation changed, it might be a screenshot on some devices
      if (currentOrientation !== prevDimensions.current.orientation) {
        showScreenshotWarning('Screen orientation changed! This action has been logged.');
        handleViolation('suspicious_activity', 'Screen orientation changed, possible screenshot attempt');
        
        // Add a more visible warning that persists
        const warning = document.createElement('div');
        warning.textContent = '⚠️ SCREENSHOT ATTEMPT DETECTED - This has been logged';
        warning.style.position = 'fixed';
        warning.style.top = '10px';
        warning.style.left = '50%';
        warning.style.transform = 'translateX(-50%)';
        warning.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
        warning.style.color = 'white';
        warning.style.padding = '15px 25px';
        warning.style.borderRadius = '5px';
        warning.style.zIndex = '10000';
        warning.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        warning.style.fontWeight = 'bold';
        warning.style.textAlign = 'center';
        warning.style.maxWidth = '90%';
        warning.style.wordBreak = 'break-word';
        
        document.body.appendChild(warning);
        
        // Remove warning after 10 seconds
        setTimeout(() => {
          if (document.body.contains(warning)) {
            document.body.removeChild(warning);
          }
        }, 10000);
      }
      
      // If dimensions changed significantly, it might be a screenshot
      const widthDiff = Math.abs(currentWidth - prevDimensions.current.width);
      const heightDiff = Math.abs(currentHeight - prevDimensions.current.height);
      
      if (widthDiff > 100 || heightDiff > 100) {
        showScreenshotWarning('Suspicious screen change detected!');
        handleViolation('suspicious_activity', `Screen size changed (${widthDiff}x${heightDiff}), possible screenshot attempt`);
      }
      
      // Check for common screenshot tool dimensions
      const commonScreenshotWidths = [1920, 1366, 1280, 1024, 800];
      const commonScreenshotHeights = [1080, 768, 800, 600];
      
      if (commonScreenshotWidths.includes(currentWidth) && commonScreenshotHeights.includes(currentHeight)) {
        showScreenshotWarning('Suspicious screen resolution detected!');
        handleViolation('suspicious_activity', `Suspicious screen resolution detected: ${currentWidth}x${currentHeight}`);
      }
      
      // Update previous dimensions
      prevDimensions.current = {
        width: currentWidth,
        height: currentHeight,
        orientation: currentOrientation
      };
    };

    // Add event listeners for mobile screenshot detection
    window.addEventListener('resize', checkForScreenshot, { passive: true });
    
    // Listen for page visibility changes (some mobile browsers trigger this on screenshots)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        showScreenshotWarning('Page was hidden! This action has been logged.');
        handleViolation('suspicious_activity', 'Page visibility changed to hidden');
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('resize', checkForScreenshot);
      document.removeEventListener('visibilitychange', checkForScreenshot);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      observer.disconnect();
    };
  }, [isSubmitted, handleViolation]);

  // Copy/Paste prevention
  useEffect(() => {
    if (isSubmitted) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('copy_attempt', 'Attempted to copy exam content');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('copy_attempt', 'Attempted to cut exam content');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('paste_attempt', 'Attempted to paste content during exam');
    };

    // Add event listeners
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);

    // Cleanup
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
    };
  }, [isSubmitted, handleViolation]);

  // Tab switch detection
  useEffect(() => {
    if (isSubmitted) return;

    const handleVisibilityChange = async () => {
      if (document.hidden && examStartTime.current) {
        await handleViolation(
          'tab_switch',
          `Switched away from exam tab (${tabSwitchCount + 1} time${tabSwitchCount === 0 ? '' : 's'})`
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSubmitted, tabSwitchCount, handleViolation]);

  // Timer
  useEffect(() => {
    if (!exam || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mark exam as started when first question is answered
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !examStartTime.current) {
      examStartTime.current = Date.now();
    }
  }, [answers]);

  const handleAnswer = (questionId: string | number, optionIndex: number) => {
    const id = String(questionId);
    setAnswers((prev) => ({ ...prev, [id]: optionIndex }));
  };

  const toggleFlag = (questionId: string | number) => {
    const id = String(questionId);
    const isFlagged = flaggedQuestions.has(id);
    
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (isFlagged) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    
    toast({ 
      title: isFlagged ? 'Flag removed' : 'Question flagged', 
      description: `Question ${id} ${isFlagged ? 'unflagged' : 'flagged for review'}`,
      duration: 10000 
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!exam || !student) {
      console.error('Exam or student data is missing');
      return;
    }
    
    console.log('Starting exam submission...');
    setIsSubmitted(true);
    setShowSubmitDialog(false);
    
    // Calculate score
    let correct = 0;
    exam.questions.forEach((q) => {
      const questionId = String(q.id);
      // If question is flagged, count it as incorrect (0 points)
      if (flaggedQuestions.has(questionId)) {
        return; // Skip to next question (counts as incorrect)
      }
      // Otherwise, check if answer is correct
      if (answers[questionId] === q.correctAnswer) {
        correct++;
      }
    });

    const scorePercentage = (correct / exam.questions.length) * 100;
    const timeSpent = (exam.duration * 60) - timeLeft; // in seconds

    // Prepare result data
    const resultData = {
      student_id: student.id,
      student_name: student.name,
      exam_id: exam.id,
      exam_title: exam.title,
      total_questions: exam.questions.length,
      correct_answers: correct,
      score_percentage: scorePercentage,
      answers,
      flagged_questions: Array.from(flaggedQuestions),
      time_spent: timeSpent
    };

    console.log('Prepared exam result data:', JSON.stringify(resultData, null, 2));

    try {
      console.log('Attempting to save exam result to Supabase...');
      const saveResult = await saveExamResult(resultData);
      console.log('Exam result saved successfully:', saveResult);

      // Navigate to exam submitted page with state
      navigate('/exam-submitted', { 
        state: { from: 'exam-submission' },
        replace: true 
      });
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving your exam results. Please check the console for details.',
        variant: 'destructive',
      });
    }
  }, [exam, answers, timeLeft, student, flaggedQuestions, navigate, toast]);

  if (isChecking || !exam || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const question: Question = exam.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const isTimeWarning = timeLeft <= 300; // 5 minutes warning

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      {/* Exam Header */}
      <header className="bg-primary text-primary-foreground shadow-elevated sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <img src={logo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-display font-bold truncate">{exam.title}</h1>
                <p className="text-xs text-primary-foreground/70 truncate">{student.name} • {student.admission_id}</p>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl ${isTimeWarning ? 'bg-destructive/20 animate-pulse-subtle' : 'bg-primary-foreground/10'} w-full sm:w-auto justify-between sm:justify-normal`}>
              <div className="flex items-center gap-2">
                <Clock size={16} className={isTimeWarning ? 'text-destructive-foreground' : ''} />
                <span className={`font-mono text-base sm:text-lg font-bold ${isTimeWarning ? 'text-destructive-foreground' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              {showCopyWarning && (
                <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-lg z-50 flex items-center gap-2 animate-fade-in-out max-w-[95vw] text-xs sm:text-sm">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span className="truncate">
                    {copyPasteViolations < 9 
                      ? `Copy/paste not allowed (${copyPasteViolations + 1}/10)`
                      : 'Final warning! Next attempt cancels exam.'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Question Navigation Sidebar */}
        <aside className="lg:w-56 bg-card border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
          <div className="sticky top-0 bg-card z-10 p-3 border-b border-border lg:border-b-0">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 hidden sm:block">Question Navigator</h3>
            <div className="flex items-center justify-between sm:block">
              <p className="text-xs text-muted-foreground sm:mb-2">
                {answeredCount}/{exam.questions.length} answered
              </p>
              <div className="flex gap-2 sm:hidden">
                <button
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(exam.questions.length - 1, prev + 1))}
                  disabled={currentQuestion === exam.questions.length - 1}
                  className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="p-3 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-5 gap-2">
              {exam.questions.map((q, index) => {
                const questionId = String(q.id);
                const isAnswered = answers[questionId] !== undefined;
                const isFlagged = flaggedQuestions.has(questionId);
                const isCurrent = index === currentQuestion;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestion(index);
                      // Close mobile sidebar if open
                      if (window.innerWidth < 1024) {
                        document.body.classList.remove('overflow-hidden');
                      }
                    }}
                    className={`relative w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-md text-sm sm:text-xs font-medium transition-all duration-200 
                      ${isCurrent ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'hover:scale-105'}
                      ${isAnswered ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}
                    `}
                    aria-label={`Question ${index + 1}${isAnswered ? ', answered' : ''}${isFlagged ? ', flagged' : ''}`}
                  >
                    <span className="relative">
                      {index + 1}
                      {isFlagged && (
                        <Flag 
                          size={10}
                          className="absolute -top-2 -right-2 text-warning fill-warning drop-shadow-sm" 
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-1.5 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-muted-foreground">Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-secondary border border-border" />
                <span className="text-muted-foreground">Not Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flag size={10} className="text-warning fill-warning" />
                <span className="text-muted-foreground">Flagged</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Question Area */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-3xl mx-auto animate-fade-in" key={currentQuestion}>
            {/* Question Counter */}
            <div className="text-lg font-medium text-muted-foreground mb-2">
              Question {currentQuestion + 1}/{exam.questions.length}
            </div>
            
            {/* Question Card */}
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-soft">
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  {(exam.id === 'exam-1' || exam.id === 'mock-2023-12') && (
                    <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-t-md w-fit mb-2">
                      <span className="font-semibold text-sm tracking-wide">
                        {getQuestionType(Number(question.id), exam.id) || 'GENERAL KNOWLEDGE'}
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    {question.passage && (
                      <div className="mb-6">
                        <button 
                          onClick={() => setShowPassage(!showPassage)}
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                          {showPassage ? (
                            <>
                              <ChevronUp size={16} />
                              <span>Hide Passage</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              <span>Show Passage</span>
                            </>
                          )}
                        </button>
                        {showPassage && (
                          <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                            <div className="whitespace-pre-line text-sm">{question.passage}</div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="space-y-4">
                      <h2 className="text-lg font-medium text-foreground">
                        {question.text}
                      </h2>
                    </div>
                  </div>
                </div>
                
                {/* Flag Button */}
                <button
                  onClick={() => toggleFlag(String(question.id))}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    flaggedQuestions.has(String(question.id))
                      ? 'bg-warning/20 text-warning'
                      : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                  }`}
                  title="Flag for review"
                >
                  <Flag size={20} className={flaggedQuestions.has(String(question.id)) ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = answers[question.id] === index;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(question.id, index)}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-4 group
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground shadow-soft' 
                          : 'bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/30'
                        }
                      `}
                    >
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all
                        ${isSelected 
                          ? 'bg-primary-foreground/20' 
                          : 'bg-background group-hover:bg-primary/10'
                        }
                      `}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {isSelected && <Check size={20} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              {currentQuestion === exam.questions.length - 1 ? (
                <button
                  onClick={() => setShowSubmitDialog(true)}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-glow transition-all"
                >
                  <Send size={18} />
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="bg-card border-border max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <div>You have answered <strong>{answeredCount}</strong> out of <strong>{exam.questions.length}</strong> questions.</div>
                  {flaggedQuestions.size > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-warning">
                      <Flag size={14} className="flex-shrink-0" />
                      <span>You have <strong>{flaggedQuestions.size}</strong> flagged question{flaggedQuestions.size !== 1 ? 's' : ''} for review.</span>
                    </div>
                  )}
                </div>

                {/* Question Status Overview */}
                <div className="mt-4">
                  <div className="font-medium text-foreground mb-2">Question Status:</div>
                  <div className="grid grid-cols-5 gap-2">
                    {exam.questions.map((q) => {
                      const isFlagged = flaggedQuestions.has(String(q.id));
                      const isAnswered = answers[String(q.id)] !== undefined;
                      
                      return (
                        <div 
                          key={q.id}
                          className={`p-2 rounded-lg text-center text-sm ${
                            isFlagged 
                              ? 'bg-warning/10 border border-warning/30 text-warning' 
                              : isAnswered 
                                ? 'bg-success/10 border border-success/30 text-success'
                                : 'bg-destructive/10 border border-destructive/30 text-destructive'
                          }`}
                          title={isFlagged ? 'Flagged' : isAnswered ? 'Answered' : 'Not Answered'}
                        >
                          {q.id}
                          {isFlagged && ' 🚩'}
                          {isAnswered && !isFlagged && ' ✓'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 text-foreground">
                  Are you sure you want to submit? This action cannot be undone.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Review Answers
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tab Switch Warning Modal */}
      <AlertDialog open={showTabSwitchWarning} onOpenChange={setShowTabSwitchWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="items-center text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="mt-4">Warning: Tab Switch Detected</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-foreground/80 space-y-4">
                <div>
                  You have been penalized for leaving the exam tab. {violationCount > 1 ? 
                  `${30 * (violationCount - 1)} seconds have been deducted from your remaining time.` : 
                  'This is your first warning. Further violations will result in time penalties.'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Violations: {violationCount} | Total tab switches: {tabSwitchCount}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogAction 
              className="w-full"
              onClick={() => setShowTabSwitchWarning(false)}
            >
              I understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Exam;
