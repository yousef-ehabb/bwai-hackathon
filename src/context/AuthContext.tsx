'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role, Session } from '@/lib/types';
import { getUsers, setUsers, getSession, setSession as saveSession, clearSession } from '@/lib/storage';

type RegisterFormData = {
  nationalId: string;
  fullName: string;
  phone: string;
  password: string;
};

type AuthContextType = {
  currentUser: Session | null;
  login: (id: string, password: string) => { success: boolean; role?: Role; error?: string };
  logout: () => void;
  register: (data: RegisterFormData) => { success: boolean; error?: string };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Session | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser(session);
    }
    setIsHydrated(true);
  }, []);

  const login = useCallback((id: string, password: string): { success: boolean; role?: Role; error?: string } => {
    const users = getUsers();
    const user = users.find((u) => u.id === id && u.password === password);
    if (user) {
      saveSession(user);
      setCurrentUser(user);
      return { success: true, role: user.role };
    }
    return { success: false, error: 'Invalid ID or password' };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  const register = useCallback((data: RegisterFormData): { success: boolean; error?: string } => {
    const users = getUsers();
    if (users.find((u) => u.id === data.nationalId)) {
      return { success: false, error: 'National ID already registered' };
    }

    const newUser: Session = {
      id: data.nationalId,
      password: data.password,
      role: 'citizen',
      name: data.fullName,
      phone: data.phone,
      district: 'District A',
    };

    setUsers([...users, newUser]);
    saveSession(newUser);
    setCurrentUser(newUser);
    return { success: true };
  }, []);

  if (!isHydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
