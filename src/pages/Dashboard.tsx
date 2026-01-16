import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import Header from '@/components/Header';
import ExamCard from '@/components/ExamCard';
import { exams } from '@/data/exams';
import { BookOpen, Trophy, Clock } from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, student, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !student) {
    return null;
  }

  const ongoingExams = exams.filter((e) => e.status === 'ongoing');
  const upcomingExams = exams.filter((e) => e.status === 'upcoming');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Welcome back, {student?.name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className="text-muted-foreground mt-1">Ready to take your exams? Your upcoming assessments are listed below.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-primary text-primary-foreground rounded-xl p-5 flex items-center gap-4 animate-slide-up shadow-md" style={{ animationDelay: '100ms' }}>
            <div className="p-3 bg-primary-foreground/10 rounded-xl">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{exams.length}</p>
              <p className="text-sm text-primary-foreground/80">Total Exams</p>
            </div>
          </div>
          <div className="bg-primary text-primary-foreground rounded-xl p-5 flex items-center gap-4 animate-slide-up shadow-md" style={{ animationDelay: '200ms' }}>
            <div className="p-3 bg-primary-foreground/10 rounded-xl">
              <Clock className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{ongoingExams.length}</p>
              <p className="text-sm text-primary-foreground/80">Active Now</p>
            </div>
          </div>
          <div className="bg-primary text-primary-foreground rounded-xl p-5 flex items-center gap-4 animate-slide-up shadow-md" style={{ animationDelay: '300ms' }}>
            <div className="p-3 bg-primary-foreground/10 rounded-xl">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{upcomingExams.length}</p>
              <p className="text-sm text-primary-foreground/80">Upcoming</p>
            </div>
          </div>
        </div>

        {/* Ongoing Exams */}
        {ongoingExams.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle" />
              <h3 className="text-lg font-display font-semibold text-foreground">Available Now</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ongoingExams.map((exam, index) => (
                <ExamCard key={exam.id} exam={exam} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Exams */}
        {upcomingExams.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-info rounded-full" />
              <h3 className="text-lg font-display font-semibold text-foreground">Upcoming Exams</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingExams.map((exam, index) => (
                <ExamCard key={exam.id} exam={exam} index={index + ongoingExams.length} />
              ))}
            </div>
          </section>
        )}

        {exams.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">No Exams Scheduled</h3>
            <p className="text-muted-foreground">Check back later for upcoming assessments.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
