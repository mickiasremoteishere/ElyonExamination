import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Student {
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);

  // Move fetchStudentData before any effects that use it
  const fetchStudentData = useCallback(async (email: string) => {
    try {
      const { data: studentData, error } = await supabase
        .from('students_1')
        .select('*')
        .eq('admission_id', email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching student data:', error);
        return null;
      }

      if (studentData) {
        const formattedStudentData: Student = {
          id: studentData.id,
          admission_id: studentData.admission_id || studentData.admissionId || '',
          name: studentData.name || studentData.student_name || '',
          class: studentData.class || studentData.class_name || '',
          section: studentData.section || studentData.section_name || '',
          roll_number: studentData.roll_number || studentData.rollNumber || studentData.roll_no || ''
        };
        return formattedStudentData;
      }
      return null;
    } catch (error) {
      console.error('Error processing student data:', error);
      return null;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      // First check for existing session in localStorage
      const storedSession = localStorage.getItem('studentSession');
      let currentStudent = null;
      let shouldContinue = true;

      if (storedSession) {
        try {
          const { student, expiresAt } = JSON.parse(storedSession);
          if (expiresAt > Date.now()) {
            currentStudent = student;
            shouldContinue = false;
          } else {
            // Clear expired session
            localStorage.removeItem('studentSession');
          }
        } catch (e) {
          console.error('Error parsing stored session:', e);
          localStorage.removeItem('studentSession');
        }
      }

      // Only proceed with Supabase check if we don't have a valid session
      if (shouldContinue) {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Error getting session:', sessionError);
            return;
          }

          if (session?.user?.email) {
            const studentData = await fetchStudentData(session.user.email);
            if (studentData) {
              currentStudent = studentData;
              // Store the session in localStorage
              localStorage.setItem('studentSession', JSON.stringify({
                student: currentStudent,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
              }));
            }
          }
        } catch (e) {
          console.error('Error during Supabase auth check:', e);
        }
      }

      // Update state once at the end
      setStudent(currentStudent);
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStudentData]);

  // Initialize auth state on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set up auth state change listener
  useEffect(() => {
    let mounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session?.user?.email) {
          try {
            const studentData = await fetchStudentData(session.user.email);
            if (studentData && mounted) {
              setStudent(studentData);
              // Update localStorage with new session
              localStorage.setItem('studentSession', JSON.stringify({
                student: studentData,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
              }));
            }
          } catch (error) {
            console.error('Error handling sign in:', error);
          }
        } else if (event === 'SIGNED_OUT' && mounted) {
          // Clear the stored session on sign out
          localStorage.removeItem('studentSession');
          setStudent(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchStudentData]);

  const login = useCallback(async (admissionId: string, password: string) => {
    try {
      console.log('Attempting login for admission ID:', admissionId);
      
      // Query the students_1 table directly
      console.log('Querying students_1 table for admission ID:', admissionId);
      const { data: studentData, error, status } = await supabase
        .from('students_1')
        .select('*')
        .eq('admission_id', admissionId)
        .maybeSingle();

      console.log('Login query status:', status);
      console.log('Login response data:', studentData);
      console.log('Login response error:', error);

      if (error) {
        console.error('Database error:', error);
        return { success: false, error: 'Database error during login' };
      }

      if (!studentData) {
        console.error('Login error: No student found with admission ID:', admissionId);
        return { success: false, error: 'Invalid Admission ID or Password' };
      }

      // Simple password check
      if (studentData.password !== password) {
        console.error('Login error: Invalid password');
        return { success: false, error: 'Invalid Admission ID or Password' };
      }

      // Map the student data to match our Student interface
      const formattedStudentData: Student = {
        id: studentData.admission_id || '',
        admission_id: studentData.admission_id || admissionId,
        name: studentData.full_name || `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim(),
        class: studentData.stream || studentData.class || '',
        section: studentData.section || '',
        roll_number: studentData.roll_number || ''
      };

      console.log('Formatted student data:', formattedStudentData);
      
      if (!formattedStudentData.name) {
        console.warn('Student name is empty. Available fields:', Object.entries(studentData));
      }
      
      // Set the student data and store session in localStorage
      setStudent(formattedStudentData);
      
      // Store the session in localStorage to persist across page refreshes
      localStorage.setItem('studentSession', JSON.stringify({
        student: formattedStudentData,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
      }));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const logout = useCallback(() => {
    // Clear the stored session
    localStorage.removeItem('studentSession');
    setStudent(null);
  }, []);

  const value = React.useMemo(() => ({
    student,
    login,
    logout,
    isAuthenticated: !!student,
    isLoading,
  }), [student, login, logout, isLoading]);

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
