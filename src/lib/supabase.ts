import { createClient } from '@supabase/supabase-js';
import { Exam } from '@/data/exams';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const maxRetries = 3;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? '*** Key Loaded ***' : 'MISSING KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with error handling
const createSupabaseClient = () => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
};

export const supabase = createSupabaseClient();

// Wrapper function for Supabase queries with retry logic
export const queryWithRetry = async (queryFn: () => Promise<any>, retries = maxRetries) => {
  try {
    return await queryFn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... (${maxRetries - retries + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (maxRetries - retries + 1)));
      return queryWithRetry(queryFn, retries - 1);
    }
    console.error('Max retries reached. Giving up.');
    throw error;
  }
};

// Types
export interface Student {
  id: string;
  admission_id: string;
  name: string;
  class: string;
  section: string;
  roll_number: string;
  created_at: string;
}

export interface Violation {
  id: string;
  student_id: string;
  student_name: string;
  admission_id: string;
  exam_id: string;
  exam_title: string;
  type: 'tab_switch' | 'copy_attempt' | 'paste_attempt' | 'fullscreen_exit' | 'suspicious_activity' | 'screenshot_attempt';
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

// Function to fetch violations with optional filters
export const fetchViolations = async (filters: {
  searchQuery?: string;
  severity?: string;
  type?: string;
}) => {
  try {
    let query = supabase
      .from('violations')
      .select('*')
      .order('timestamp', { ascending: false });

    // Apply filters if provided
    if (filters.searchQuery) {
      query = query.or(
        `student_name.ilike.%${filters.searchQuery}%,admission_id.ilike.%${filters.searchQuery}%`
      );
    }

    if (filters.severity && filters.severity !== 'all') {
      query = query.eq('severity', filters.severity);
    }

    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Violation[];
  } catch (error) {
    console.error('Error fetching violations:', error);
    throw error;
  }
};

// Function to get violation statistics
export const getViolationStats = async () => {
  try {
    const { data, error } = await supabase
      .from('violations')
      .select('severity');

    if (error) throw error;

    return {
      total: data?.length || 0,
      high: data?.filter(v => v.severity === 'high').length || 0,
      medium: data?.filter(v => v.severity === 'medium').length || 0,
      low: data?.filter(v => v.severity === 'low').length || 0,
    };
  } catch (error) {
    console.error('Error fetching violation stats:', error);
    throw error;
  }
};

export const saveViolation = async (violation: Omit<Violation, 'id' | 'timestamp'>) => {
  try {
    const { data, error } = await supabase
      .from('violations')
      .insert([{ ...violation, timestamp: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving violation:', error);
    throw error;
  }
};

// Types
export interface ExamResult {
  id?: string;
  student_id: string;
  student_name: string;
  exam_id: string;
  exam_title: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  answers: Record<string, number>;
  flagged_questions: string[];
  time_spent: number; // in seconds
  submitted_at: string;
}

// Function to save exam results
export const saveExamResult = async (result: Omit<ExamResult, 'id' | 'submitted_at'>) => {
  console.log('Attempting to save to Supabase with data:', JSON.stringify(result, null, 2));
  
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .insert([
        { 
          ...result,
          submitted_at: new Date().toISOString()
        }
      ])
      .select();

    console.log('Supabase response - data:', data);
    
    if (error) {
      console.error('Error saving exam result:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Exception in saveExamResult:', error);
    throw error;
  }
};

// Function to get exam results for a student
export const getStudentExamResults = async (studentId: string) => {
  const { data, error } = await supabase
    .from('exam_results')
    .select('*')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching exam results:', error);
    throw error;
  }

  return data as ExamResult[];
};

// Define the DatabaseStudent interface that matches our database structure
export interface DatabaseStudent {
  id: string;
  admission_id?: string;
  name?: string;
  class?: string;
  section?: string;
  roll_number?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
  exams_taken?: number;
  average_score?: number;
  created_at?: string;
}

// Function to fetch all students from the database
export const fetchStudents = async (examId?: string) => {
  try {
    console.log('Fetching students from Supabase...');
    
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('students_1')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      return data;
    };

    const studentsData = await queryWithRetry(fetchData);
    
    if (!studentsData || studentsData.length === 0) {
      console.warn('No students found in the database');
      return [];
    }

    if (!studentsData || studentsData.length === 0) {
      console.warn('No students found in the database');
      return [];
    }

    // If no examId is provided, return basic student data
    if (!examId) {
      return studentsData.map((student, index) => ({
        id: student.admission_id || `student-${index}`,
        admissionId: student.admission_id || '',
        name: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unnamed Student',
        class: student.stream || student.grade || 'N/A',
        section: student.section || 'N/A',
        rollNumber: student.roll_number?.toString() || 'N/A',
        email: student.email || '',
        phone: student.phone?.toString() || '',
        status: 'not_taken', // Default status
        examsTaken: 0,
        averageScore: 0,
        age: student.age,
        gender: student.sex,
        school: student.school,
        password: student.password
      }));
    }

    // Fetch exam results for the specified exam
    const { data: examResults, error: resultsError } = await supabase
      .from('exam_results')
      .select('*')
      .eq('exam_id', examId);

    if (resultsError) {
      console.error('Error fetching exam results:', resultsError);
      throw resultsError;
    }

    // Create a map of student_id to exam result
    const examResultsMap = new Map();
    examResults?.forEach(result => {
      examResultsMap.set(result.student_id, result);
    });

    // Transform the data with exam status
    return studentsData.map((student, index) => {
      const studentId = student.admission_id || `student-${index}`;
      const examResult = examResultsMap.get(studentId);
      
      let status: 'submitted' | 'cancelled' | 'not_taken' = 'not_taken';
      let score = 0;
      
      if (examResult) {
        if (examResult.answers?._cancelled || examResult.status === 'cancelled') {
          status = 'cancelled';
        } else {
          status = 'submitted';
          score = examResult.score_percentage || 0;
        }
      }

      return {
        id: studentId,
        admissionId: student.admission_id || '',
        name: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unnamed Student',
        class: student.stream || student.grade || 'N/A',
        section: student.section || 'N/A',
        rollNumber: student.roll_number?.toString() || 'N/A',
        email: student.email || '',
        phone: student.phone?.toString() || '',
        status,
        examsTaken: examResult ? 1 : 0,
        averageScore: score,
        age: student.age,
        gender: student.sex,
        school: student.school,
        password: student.password
      };
    });
  } catch (error) {
    console.error('Error in fetchStudents:', error);
    throw error; // Re-throw the error to be handled by the calling component
  }
};

// Function to check if a student has already taken an exam and get the result
export interface DashboardStats {
  activeExams: number;
  totalResults: number;
  totalViolations: number;
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
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get current date and date from one month ago
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    // Format dates for Supabase query
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    // Get active exams
    const { data: activeExamsData, error: examsError } = await supabase
      .from('exams')
      .select('*')
      .eq('status', 'active');
      
    if (examsError) throw examsError;
    
    // Get total results
    const { count: totalResults, error: resultsError } = await supabase
      .from('exam_results')
      .select('*', { count: 'exact', head: true });
      
    if (resultsError) throw resultsError;
    
    // Get results from last month for comparison
    const { count: lastMonthResults, error: lastMonthResultsError } = await supabase
      .from('exam_results')
      .select('*', { count: 'exact', head: true })
      .lt('submitted_at', formatDate(now))
      .gte('submitted_at', formatDate(oneMonthAgo));
      
    if (lastMonthResultsError) throw lastMonthResultsError;
    
    // Calculate results change
    const resultsChange = totalResults && lastMonthResults 
      ? Math.round(((totalResults - lastMonthResults) / (lastMonthResults || 1)) * 100) 
      : 0;
    
    // Get total violations
    const { count: totalViolations, error: violationsError } = await supabase
      .from('violations')
      .select('*', { count: 'exact', head: true });
      
    if (violationsError) throw violationsError;
    
    // Get violations from last month for comparison
    const { count: lastMonthViolations, error: lastMonthViolationsError } = await supabase
      .from('violations')
      .select('*', { count: 'exact', head: true })
      .lt('timestamp', formatDate(now))
      .gte('timestamp', formatDate(oneMonthAgo));
      
    if (lastMonthViolationsError) throw lastMonthViolationsError;
    
    // Calculate violations change
    const violationsChange = totalViolations && lastMonthViolations
      ? Math.round(((totalViolations - lastMonthViolations) / (lastMonthViolations || 1)) * 100)
      : 0;
    
    // Get recent results (latest 5)
    const { data: recentResultsData, error: recentResultsError } = await supabase
      .from('exam_results')
      .select('id, student_name, exam_title, score_percentage, submitted_at')
      .order('submitted_at', { ascending: false })
      .limit(5);

    if (recentResultsError) throw recentResultsError;

    // Get recent violations (latest 3)
    const { data: recentViolationsData, error: recentViolationsError } = await supabase
      .from('violations')
      .select('id, student_name, exam_title, type, timestamp')
      .order('timestamp', { ascending: false })
      .limit(3);

    if (recentViolationsError) throw recentViolationsError;

    return {
      activeExams: activeExamsData?.length || 0,
      totalResults: totalResults || 0,
      totalViolations: totalViolations || 0,
      resultsChange: resultsChange > 0 ? `+${resultsChange}%` : `${resultsChange}%`,
      violationsChange: violationsChange > 0 ? `+${violationsChange}%` : `${violationsChange}%`,
      recentResults: recentResultsData || [],
      recentViolations: recentViolationsData || [],
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return mock data in case of error
    // Return mock data in case of error
    return {
      activeExams: 2,
      totalResults: 5,
      totalViolations: 5,
      resultsChange: '+24%',
      violationsChange: '-8%',
      recentResults: [],
      recentViolations: []
    };
  }
};

export const hasStudentTakenExam = async (studentId: string, examId: string): Promise<ExamResult | null> => {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('exam_id', examId)
      .order('submitted_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking exam attempt:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] as ExamResult : null;
  } catch (error) {
    console.error('Error in hasStudentTakenExam:', error);
    return null;
  }
};

// Function to save a cancelled exam
export const saveCancelledExam = async (studentId: string, studentName: string, examId: string, examTitle: string) => {
  const cancelledExam = {
    student_id: studentId,
    student_name: studentName,
    exam_id: examId,
    exam_title: examTitle,
    total_questions: 0,
    correct_answers: 0,
    score_percentage: 0, // 0% score for cancelled exams
    answers: { 
      _cancelled: true,
      _reason: 'Exam cancelled due to excessive tab switching (10+ times)'
    },
    flagged_questions: [],
    time_spent: 0
  };

  try {
    const { data, error } = await supabase
      .from('exam_results')
      .insert([cancelledExam])
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error saving cancelled exam:', error);
    throw error;
  }
};
