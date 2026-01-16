import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface Student {
  id: string;
  admission_id: string;
  name: string;
  class: string;
  section: string;
  roll_number: string;
}

interface AuthContextType {
  student: Student | null;
  login: (admissionId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    student: Student | null;
    isLoading: boolean;
    isInitialized: boolean;
  }>({
    student: null,
    isLoading: false,
    isInitialized: false,
  });

  // Fetch student data
  const fetchStudentData = useCallback(async (email: string): Promise<Student | null> => {
    try {
      const { data, error } = await supabase
        .from('students_1')
        .select('*')
        .eq('admission_id', email)
        .maybeSingle();

      if (error || !data) {
        console.error('Error fetching student data:', error);
        return null;
      }

      return {
        id: data.admission_id || '',
        admission_id: data.admission_id || '',
        name: data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        class: data.stream || data.class || '',
        section: data.section || '',
        roll_number: data.roll_number || ''
      };
    } catch (error) {
      console.error('Error in fetchStudentData:', error);
      return null;
    }
  }, []);

  // Login function
  const login = useCallback(async (admissionId: string, password: string) => {
    try {
      console.log('Attempting login for admission ID:', admissionId);
      
      const { data: studentData, error } = await supabase
        .from('students_1')
        .select('*')
        .eq('admission_id', admissionId)
        .maybeSingle();

      console.log('Login query status:', 200);
      console.log('Login response data:', studentData);

      if (error || !studentData) {
        return { success: false, error: 'Invalid Admission ID or Password' };
      }

      if (studentData.password !== password) {
        return { success: false, error: 'Invalid Admission ID or Password' };
      }

      const student: Student = {
        id: studentData.admission_id || '',
        admission_id: studentData.admission_id || admissionId,
        name: studentData.full_name || `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim(),
        class: studentData.stream || studentData.class || '',
        section: studentData.section || '',
        roll_number: studentData.roll_number || ''
      };

      // Store session
      localStorage.setItem('studentSession', JSON.stringify({
        student,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      }));

      setState(prev => ({ ...prev, student }));
      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('studentSession');
    setState(prev => ({ ...prev, student: null }));
  }, []);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const storedSession = localStorage.getItem('studentSession');
        
        if (storedSession) {
          try {
            const { student, expiresAt } = JSON.parse(storedSession);
            if (expiresAt > Date.now()) {
              setState(prev => ({ ...prev, student, isLoading: false, isInitialized: true }));
              return;
            }
          } catch (e) {
            console.error('Error parsing stored session:', e);
          }
          localStorage.removeItem('studentSession');
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setState(prev => ({ ...prev, isLoading: false, isInitialized: true }));
      }
    };

    checkAuth();
  }, []);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const student = await fetchStudentData(session.user.email);
          if (student) {
            setState(prev => ({ ...prev, student }));
          }
        } else if (event === 'SIGNED_OUT') {
          setState(prev => ({ ...prev, student: null }));
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchStudentData]);

  const value = useMemo(() => ({
    student: state.student,
    login,
    logout,
    isAuthenticated: !!state.student,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized
  }), [state.student, state.isLoading, state.isInitialized, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
