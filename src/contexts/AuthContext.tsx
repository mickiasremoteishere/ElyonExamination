import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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

  // Handle authentication state changes and initial session check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          // Fetch student data from students_1 table instead of students
          console.log('Fetching student data for email:', session.user.email);
          const { data: studentData, error: studentError } = await supabase
            .from('students_1')
            .select('*')
            .eq('admission_id', session.user.email) // Assuming email is used as admission_id
            .maybeSingle();
          
          console.log('Student data from DB:', studentData);
          console.log('Error from DB:', studentError);
          
          if (studentError) {
            console.error('Error fetching student data:', studentError);
          } else if (studentData) {
            // Map the data to match our Student interface
            const formattedStudentData: Student = {
              id: studentData.id,
              admission_id: studentData.admission_id || studentData.admissionId || '',
              name: studentData.name || studentData.student_name || '',
              class: studentData.class || studentData.class_name || '',
              section: studentData.section || studentData.section_name || '',
              roll_number: studentData.roll_number || studentData.rollNumber || studentData.roll_no || ''
            };
            console.log('Formatted student data:', formattedStudentData);
            setStudent(formattedStudentData);
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, fetching student data for:', session.user.email);
          // Fetch student data from students_1 table
          const { data: studentData, error } = await supabase
            .from('students_1')
            .select('*')
            .eq('admission_id', session.user.email) // Assuming email is used as admission_id
            .maybeSingle();
          
          console.log('Auth state change - Student data:', studentData);
          console.log('Auth state change - Error:', error);
          
          if (error) {
            console.error('Error fetching student data on auth state change:', error);
          } else if (studentData) {
            // Map the data to match our Student interface with fallbacks
            const formattedStudentData: Student = {
              id: studentData.id,
              admission_id: studentData.admission_id || studentData.admissionId || session.user.email || '',
              name: studentData.name || studentData.student_name || '',
              class: studentData.class || studentData.class_name || '',
              section: studentData.section || studentData.section_name || '',
              roll_number: studentData.roll_number || studentData.rollNumber || studentData.roll_no || ''
            };
            console.log('Auth state change - Formatted student data:', formattedStudentData);
            setStudent(formattedStudentData);
          }
        } else if (event === 'SIGNED_OUT') {
          setStudent(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (admissionId: string, password: string) => {
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
        
        // Try to find any student to check if the table has data
        const { data: anyStudent } = await supabase
          .from('students_1')
          .select('*')
          .limit(1);
          
        console.log('Sample student data (first record):', anyStudent?.[0]);
        
        return { success: false, error: 'Invalid Admission ID or Password' };
      }

      // Log all fields from the student data for debugging
      console.log('Raw student data fields:', Object.keys(studentData));
      
      // Simple password check
      if (studentData.password !== password) {
        console.error('Login error: Invalid password');
        return { success: false, error: 'Invalid Admission ID or Password' };
      }

      // Map the student data to match our Student interface with the actual database fields
      const formattedStudentData: Student = {
        id: studentData.admission_id || '', // Using admission_id as ID since it's the primary key
        admission_id: studentData.admission_id || admissionId,
        name: studentData.full_name || `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim(),
        class: studentData.stream || studentData.class || '', // Using 'stream' as class if available
        section: studentData.section || '',
        roll_number: studentData.roll_number || ''
      };

      console.log('Formatted student data:', formattedStudentData);
      
      if (!formattedStudentData.name) {
        console.warn('Student name is empty. Available fields:', Object.entries(studentData));
      }
      
      setStudent(formattedStudentData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = () => {
    setStudent(null);
  };

  const value = {
    student,
    login,
    logout,
    isAuthenticated: !!student,
    isLoading,
  };

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
