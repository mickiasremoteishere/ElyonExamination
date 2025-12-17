// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, unstable_HistoryRouter as HistoryRouter, Outlet } from "react-router-dom";
import { createBrowserHistory } from 'history';


// Create a custom history object to access the router's history
export const history = createBrowserHistory();

// Set future flags for React Router v7
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Exam from "./pages/Exam";
import ResultsPage from "@/pages/ResultsPage";
import ExamSubmittedPage from "./pages/ExamSubmittedPage";
import ExamCancelled from "./pages/ExamCancelled";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentsPage from "./pages/admin/StudentsPage";
import AdminResultsPage from "./pages/admin/ResultsPage";
import ViolationsPage from "./pages/admin/ViolationsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log('App rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HistoryRouter history={history as any} {...routerConfig}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/exam/:id" element={<Exam />} />
                <Route path="/exam-submitted" element={<ExamSubmittedPage />} />
                <Route path="/exam-cancelled" element={<ExamCancelled />} />
                <Route path="/results" element={<ResultsPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin">
                  <Route path="login" element={<AdminLogin />} />
                  <Route element={<AdminLayout><Outlet /></AdminLayout>}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="students" element={<StudentsPage />} />
                    <Route path="results" element={<AdminResultsPage />} />
                    <Route path="violations" element={<ViolationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
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
};

export default App;