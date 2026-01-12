import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { studentResults, violations } from '@/data/mockData';
import { exams } from '@/data/exams';
import { Users, FileText, AlertTriangle, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import { fetchStudents, getDashboardStats, queryWithRetry } from '@/lib/supabase';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface Student {
  id: string;
  admissionId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  status?: string;
}

const AdminDashboard = () => {
  useDocumentTitle('Admin Dashboard');
  const { admin } = useAdminAuth();
  const [dashboardStats, setDashboardStats] = useState<{
    totalStudents: string;
    activeExams: string;
    totalResults: string;
    totalViolations: string;
    resultsChange: string;
    violationsChange: string;
    recentResults: Array<{
      id: string;
      student_name: string;
      exam_title: string;
      score_percentage: number;
      submitted_at: string;
    }>;
    recentViolations: Array<{
      id: string;
      student_name: string;
      exam_title: string;
      type: string;
      timestamp: string;
    }>;
  }>({
    totalStudents: '...',
    activeExams: '...',
    totalResults: '...',
    totalViolations: '...',
    resultsChange: '...',
    violationsChange: '...',
    recentResults: [],
    recentViolations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const loadFallbackData = () => {
    setIsUsingFallback(true);
    return {
      totalStudents: studentResults.length.toString(),
      activeExams: exams.filter(e => e.status === 'ongoing').length.toString(),
      totalResults: studentResults.length.toString(),
      totalViolations: violations.length.toString(),
      resultsChange: '+24%',
      violationsChange: '-8%',
      recentResults: studentResults.slice(0, 5).map(r => ({
        id: r.id,
        student_name: r.studentName,
        exam_title: r.examTitle,
        score_percentage: r.percentage,
        submitted_at: new Date().toISOString()
      })),
      recentViolations: violations.slice(0, 3).map(v => ({
        id: v.id,
        student_name: v.studentName,
        exam_title: v.examTitle,
        type: v.type,
        timestamp: v.timestamp
      }))
    };
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load data with retry logic
        const [students, stats] = await Promise.all([
          queryWithRetry(async () => {
            try {
              return await fetchStudents();
            } catch (e) {
              console.error('Error fetching students:', e);
              return [];
            }
          }),
          queryWithRetry(async () => {
            try {
              return await getDashboardStats();
            } catch (e) {
              console.error('Error fetching dashboard stats:', e);
              return null;
            }
          })
        ]);

        if (stats) {
          setDashboardStats({
            totalStudents: students?.length?.toString() || '0',
            activeExams: stats.activeExams.toString(),
            totalResults: stats.totalResults.toString(),
            totalViolations: stats.totalViolations.toString(),
            resultsChange: stats.resultsChange,
            violationsChange: stats.violationsChange,
            recentResults: stats.recentResults || [],
            recentViolations: stats.recentViolations || []
          });
        } else {
          setError('Unable to load dashboard data. Using sample data.');
          setDashboardStats(loadFallbackData());
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setError('Failed to load dashboard data. Using sample data.');
        setDashboardStats(loadFallbackData());
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const stats = [
    { 
      label: 'Total Students', 
      value: dashboardStats.totalStudents, 
      icon: Users, 
      color: 'bg-info/10 text-info',
      change: ''
    },
    { 
      label: 'Active Exams', 
      value: dashboardStats.activeExams, 
      icon: BookOpen, 
      color: 'bg-success/10 text-success',
      change: '+2 from last month'
    },
    { 
      label: 'Total Results', 
      value: dashboardStats.totalResults, 
      icon: FileText, 
      color: 'bg-primary/10 text-primary',
      change: `${dashboardStats.resultsChange} from last month`
    },
    { 
      label: 'Violations', 
      value: dashboardStats.totalViolations, 
      icon: AlertTriangle, 
      color: 'bg-destructive/10 text-destructive',
      change: `${dashboardStats.violationsChange} from last month`
    },
  ];

  const recentResults = studentResults.slice(0, 5);
  const recentViolations = violations.slice(0, 3);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              Welcome back, {admin?.name?.split(' ')[0] || 'Admin'}!
            </h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your exams today.</p>
          </div>
          {isUsingFallback && (
            <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              Using sample data
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 animate-slide-up hover:shadow-soft transition-shadow"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-foreground mt-1">
                  {isLoading ? '...' : stat.value}
                </p>
                {stat.change && (
                  <p className={`text-xs mt-2 ${
                    stat.change.startsWith('+') ? 'text-success' : 
                    stat.change.startsWith('-') ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {stat.change} {stat.change && 'from last month'}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Recent Results</h2>
            <TrendingUp size={20} className="text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {dashboardStats.recentResults?.length > 0 ? (
              dashboardStats.recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{result.student_name}</p>
                    <p className="text-xs text-muted-foreground">{result.exam_title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{result.score_percentage}%</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(result.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isLoading ? 'Loading...' : 'No recent results found'}
              </p>
            )}
          </div>
        </div>

        {/* Recent Violations */}
        <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Recent Violations</h2>
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <div className="space-y-3">
            {dashboardStats.recentViolations?.length > 0 ? (
              dashboardStats.recentViolations.map((violation) => (
                <div key={violation.id} className="flex items-start p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                  <div className="bg-destructive/10 p-1.5 rounded-lg mr-3">
                    <AlertTriangle size={16} className="text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{violation.student_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {violation.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(violation.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isLoading ? 'Loading...' : 'No recent violations found'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
