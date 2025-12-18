// src/contexts/AdminAuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Admin {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'superadmin';
  email?: string;
  phone?: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (updates: Partial<Admin>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  error: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Mock admin data with additional fields
const mockAdmins: Record<string, { password: string; admin: Admin }> = {
  'ErgoZFood': {
    password: 'ERGO@ELYON+1234',
    admin: {
      id: '1',
      username: 'ErgoZFood',
      name: 'System Administrator',
      email: 'admin@school.edu',
      phone: '+1234567890',
      role: 'superadmin',
    },
  },
  'HldanaZPresident': {
    password: '!Hldana@ZZZ',
    admin: {
      id: '2',
      username: 'HldanaZPresident',
      name: 'President, Hldana',
      email: 'teacher@school.edu',
      phone: '+1987654321',
      role: 'admin',
    },
  },

  'ZenaZPrestigious': {
    password: 'Zenane@Prestigious',
    admin: {
      id: '2',
      username: 'ZenaZPrestigious',
      name: 'Zena Negash',
      email: 'teacher@elyonaris.edu',
      phone: '+1987654321',
      role: 'admin',
    },
  },
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('Login attempt for:', username);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const adminData = mockAdmins[username];
      if (adminData && adminData.password === password) {
        console.log('Login successful for:', username);
        // Only set the admin in state, not in localStorage
        setAdmin(adminData.admin);
        return true;
      }
      console.warn('Invalid credentials for:', username);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out admin');
    setAdmin(null);
    // No need to clear from localStorage since we're not using it
  };

  const updateProfile = async (updates: Partial<Admin>): Promise<boolean> => {
    if (!admin) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      // In a real app, you would make an API call to update the admin's profile
      const updatedAdmin = { ...admin, ...updates };
      mockAdmins[admin.username].admin = updatedAdmin;
      setAdmin(updatedAdmin);
      
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!admin) return { success: false, message: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      // Verify current password
      if (mockAdmins[admin.username].password !== currentPassword) {
        return { success: false, message: 'Current password is incorrect' };
      }
      
      // Update password
      mockAdmins[admin.username].password = newPassword;
      
      return { success: true, message: 'Password updated successfully' };
    } catch (err) {
      console.error('Error changing password:', err);
      return { success: false, message: 'Failed to change password. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    admin,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!admin,
    loading,
    error
  };

  console.log('Auth context value:', value);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};