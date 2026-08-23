import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Try to load user from localStorage for persistence during mock dev
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mockPatientUser');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (phone: string) => {
    const mockUser: User = {
      id: 'mock-patient-uuid-1234',
      phone: phone,
      role: 'PATIENT'
    };
    setUser(mockUser);
    localStorage.setItem('mockPatientUser', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockPatientUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
