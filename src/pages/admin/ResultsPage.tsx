import { useState, useEffect } from 'react';
import { Search, Filter, Download, TrendingUp, TrendingDown, AlertCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notifyResultsPublished } from '@/utils/examNotifications';
import { supabase, queryWithRetry } from '@/lib/supabase';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface ExamResult {
  id: string;
  student_id: string;
  student_name: string;
  exam_id: string;
  exam_title: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  answers: Record<string, any>;
  time_spent: number;
  submitted_at: string;
  status: 'pending' | 'submitted' | 'cancelled' | 'published';
}

const ResultsPage = () => {
  useDocumentTitle('Exam Results');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExam, setFilterExam] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchData = async () => {
          const { data, error } = await supabase
            .from('exam_results')
            .select('*')
            .order('submitted_at', { ascending: false });
          
          if (error) throw error;
          return data || [];
        };

        const resultsData = await queryWithRetry(fetchData);
        setResults(resultsData);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load exam results. Using sample data.');
        // Set some sample data
        setResults([
          {
            id: '1',
            student_id: 'student-1',
            student_name: 'John Doe',
            exam_id: 'exam-1',
            exam_title: 'Mathematics Midterm',
            total_questions: 20,
            correct_answers: 15,
            score_percentage: 75,
            answers: {},
            time_spent: 1800,
            submitted_at: new Date().toISOString(),
            status: 'pending'
          },
          // Add more sample data as needed
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Helper function to format duration in mm:ss format
  const formatDuration = (seconds: number): string => {
    if (!seconds && seconds !== 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Define the transformed result type
  interface TransformedResult {
    id: string;
    studentName: string;
    admissionId: string;
    examTitle: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    status: ExamResult['status'];
    timeSpent: number;
    duration: string;
    class: string;
    section: string;
  }

  // Transform results to match the expected format
  const transformedResults: TransformedResult[] = results.map(result => ({
    id: result.id,
    studentName: result.student_name,
    admissionId: result.student_id,
    examTitle: result.exam_title,
    score: result.correct_answers,
    totalQuestions: result.total_questions,
    percentage: Math.round(result.score_percentage),
    status: result.status,
    timeSpent: result.time_spent || 0, // Store the raw seconds
    duration: formatDuration(result.time_spent || 0), // Formatted as mm:ss
    class: result.answers?.class || 'N/A',
    section: result.answers?.section || 'N/A'
  }));

  const uniqueExams = ['all', ...new Set(results.map(r => r.exam_title))];

  const filteredResults = transformedResults.filter((result) => {
    const matchesSearch = 
      result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.admissionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExam = filterExam === 'all' || result.examTitle === filterExam;
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    return matchesSearch && matchesExam && matchesStatus;
  });

  const averageScore = filteredResults.length > 0 
    ? Math.round(filteredResults.reduce((acc, r) => acc + r.percentage, 0) / filteredResults.length)
    : 0;

  const submittedCount = filteredResults.filter(r => r.status === 'submitted').length;
  const totalCount = filteredResults.length;
  const submittedRate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  const handlePublishResults = async (examId: string) => {
    try {
      // In a real app, this would update the database
      // await updateResultsStatus(examId, 'published');
      
      // Update local state
      const updatedResults = results.map(result => {
        if (result.exam_id === examId) {
          return { 
            ...result, 
            status: 'published' as const 
          };
        }
        return result;
      });
      
      setResults(updatedResults);
      
      // Find the exam to get its title
      const exam = updatedResults.find(r => r.exam_id === examId);
      if (exam) {
        // Send notification to students
        await notifyResultsPublished(exam.exam_title, examId);
      }
      
      // Show success message (you might want to use a toast notification here)
      console.log(`Results published for exam ${examId}`);
    } catch (error) {
      console.error('Error publishing results:', error);
      // Handle error (e.g., show error toast)
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Results</h1>
          <p className="text-muted-foreground">View and manage all exam results</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
        <button className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Download size={18} />
          Export Results
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 animate-slide-up">
          <p className="text-sm text-muted-foreground">Total Results</p>
          <p className="text-2xl font-display font-bold text-foreground">{filteredResults.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-muted-foreground">Average Score</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-display font-bold text-foreground">{averageScore}%</p>
            <TrendingUp size={18} className="text-success" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-muted-foreground">Submission Rate</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-display font-bold text-foreground">{submittedCount} / {totalCount}</p>
            <span className="text-sm text-muted-foreground">({submittedRate}%)</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or admission ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <select
          value={filterExam}
          onChange={(e) => setFilterExam(e.target.value)}
          className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Exams</option>
          {uniqueExams
            .filter(exam => exam !== 'all')
            .map(exam => (
              <option key={exam} value={exam}>{exam}</option>
            ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="cancelled">Cancelled</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Admission ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Exam</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Score</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Percentage</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Duration</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => (
                  <tr 
                    key={result.id} 
                    className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{result.studentName}</p>
                        <p className="text-xs text-muted-foreground">{result.class} - {result.section}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-secondary px-2 py-1 rounded text-sm text-foreground">{result.admissionId}</code>
                    </td>
                    <td className="px-6 py-4 text-foreground">{result.examTitle}</td>
                    <td className="px-6 py-4 text-foreground font-medium">
                      {result.score}/{result.totalQuestions}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${result.percentage >= 60 ? 'bg-success' : 'bg-destructive'}`}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                        <span className={`font-medium ${result.percentage >= 60 ? 'text-success' : 'text-destructive'}`}>
                          {result.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">{result.duration}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        result.status === 'submitted' 
                          ? 'bg-success/10 text-success border border-success/20' 
                          : result.status === 'cancelled'
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : result.status === 'published'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-muted/10 text-muted-foreground border border-border'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {result.status === 'published' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled
                          className="flex items-center gap-2"
                        >
                          <Bell className="h-4 w-4 text-green-500" />
                          <span>Results Published</span>
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePublishResults(result.examTitle)}
                          className="flex items-center gap-2"
                        >
                          <Bell className="h-4 w-4" />
                          <span>Publish Results</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    No results found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;