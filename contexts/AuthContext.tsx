import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthState, AuthSession, User, AuthError } from '@/types/auth';

interface AuthContextType {
  // State
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  isTokenExpired: boolean;

  // Actions
  signInWithEmail: (email: string, password: string) => Promise<AuthSession>;
  signUpWithEmail: (email: string, password: string, metadata?: any) => Promise<AuthSession>;
  signInWithGoogle: () => Promise<AuthSession>;
  signInWithFacebook: () => Promise<AuthSession>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<AuthSession | null>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}