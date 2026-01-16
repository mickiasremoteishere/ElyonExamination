import { useAuth } from '@/contexts/NewAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, User, BookOpen, Calendar } from 'lucide-react';

export const ExamSubmitted = () => {
  const { student } = useAuth();
  const navigate = useNavigate();
  const currentDate = new Date();
  
  // Calculate next Friday at 12:00 PM
  const nextFriday = new Date();
  nextFriday.setDate(currentDate.getDate() + ((5 - currentDate.getDay() + 7) % 7));
  nextFriday.setHours(12, 0, 0, 0);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Exam Successfully Submitted!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for completing the exam. Your results are being processed.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-blue-500" />
          Results Announcement
        </h2>
        <p className="text-foreground mb-6">
          Your exam results will be available on {nextFriday.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} at 12:00 PM (Local Time).
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-blue-700 dark:text-blue-300">
            You will receive a notification when your results are ready. Please check back on the specified date and time.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <User className="mr-2 h-5 w-5 text-green-500" />
          Your Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">{student?.name || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Admission ID</p>
            <p className="font-medium">{student?.admission_id || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Class/Stream</p>
            <p className="font-medium">{student?.class || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Section</p>
            <p className="font-medium">{student?.section || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Submission Date</p>
            <p className="font-medium">
              {currentDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important Notice</h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                Your exam has been successfully submitted. The results will be available on the specified date. 
                Please do not contact the administration regarding results before the announced date.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button 
          onClick={() => navigate('/dashboard')}
          className="w-full sm:w-auto"
        >
          Back to Dashboard
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.print()}
          className="w-full sm:w-auto"
        >
          Print Submission Receipt
        </Button>
      </div>
    </div>
  );
};

export default ExamSubmitted;
