import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamResult, getStudentExamResults } from '@/lib/supabase';
import { useAuth } from '@/contexts/NewAuthContext';
import { Check, X, Clock, Award, BookOpen, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ExamResults = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { student } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadResults = async () => {
      if (!student?.id) return;
      
      try {
        setLoading(true);
        const data = await getStudentExamResults(student.id);
        setResults(data);
      } catch (error) {
        console.error('Failed to load exam results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [student?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No exam results found</h3>
        <p className="text-muted-foreground mt-2">Complete an exam to see your results here.</p>
        <Button className="mt-6" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Exam Results</h1>
          <p className="text-muted-foreground">View your past exam performances</p>
        </div>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{result.exam_title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(result.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.score_percentage >= 70 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : result.score_percentage >= 50 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {Math.round(result.score_percentage)}%
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Correct</p>
                    <p className="font-medium">{result.correct_answers} / {result.total_questions}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <X className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                    <p className="font-medium">{result.total_questions - result.correct_answers} / {result.total_questions}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time Spent</p>
                    <p className="font-medium">
                      {Math.floor(result.time_spent / 60)}m {result.time_spent % 60}s
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="font-medium">{Math.round(result.score_percentage)}%</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigate(`/exam/${result.exam_id}/results/${result.id}`)}
              >
                <BarChart className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExamResults;
