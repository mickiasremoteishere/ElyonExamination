import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { createBrowserHistory } from 'history';
import { AuthProvider } from "@/contexts/NewAuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Exam from "./pages/Exam";
import ResultsPage from "@/pages/ResultsPage";
import ExamSubmittedPage from "./pages/ExamSubmittedPage";
import ExamCancelled from "./pages/ExamCancelled";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import SuperadminLayout from "./components/admin/SuperadminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SuperadminDashboard from "./pages/admin/SuperadminDashboard";
import StudentsPage from "./pages/admin/StudentsPage";
import AdminResultsPage from "./pages/admin/ResultsPage";
import ViolationsPage from "./pages/admin/ViolationsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ExamManagement from "./pages/admin/superadmin/ExamManagement";
import UserAccessManagement from "./pages/admin/superadmin/UserAccessManagement";
import NotFound from "./pages/NotFound";
import WelcomeScreen from "./components/WelcomeScreen";
import ForgotIdPage from "./pages/ForgotIdPage";

const queryClient = new QueryClient();
const history = createBrowserHistory();

const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HistoryRouter history={history as any} {...routerConfig}>
              <Routes>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/login" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/exam/:id" element={<Exam />} />
                <Route path="/exam-submitted" element={<ExamSubmittedPage />} />
                <Route path="/forgot-id" element={<ForgotIdPage />} />
                <Route path="/exam-cancelled" element={<ExamCancelled />} />
                <Route path="/results" element={<ResultsPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin">
                  <Route path="login" element={<AdminLogin />} />
                  <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="students" element={<StudentsPage />} />
                    <Route path="results" element={<AdminResultsPage />} />
                    <Route path="violations" element={<ViolationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                  
                  {/* Superadmin Routes */}
                  <Route path="superadmin" element={<SuperadminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<SuperadminDashboard />} />
                    
                    {/* Exam Management Routes */}
                    <Route path="exams" element={<ExamManagement />}>
                      <Route index element={<Navigate to="status" replace />} />
                      <Route path="status" element={<div>Exam Status</div>} />
                      <Route path="schedule" element={<div>Exam Schedule</div>} />
                      <Route path="configure" element={<div>Configure Exam</div>} />
                    </Route>
                    
                    {/* User Access Management */}
                    <Route path="users" element={<UserAccessManagement />} />
                    
                    {/* Add more superadmin specific routes here */}
                  </Route>
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HistoryRouter>
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;