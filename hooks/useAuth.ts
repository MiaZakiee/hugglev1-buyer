import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth';
import { AuthState, AuthSession, User, AuthError } from '@/types/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  /**
   * Initialize authentication state
   */
  const initializeAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const session = await authService.getCurrentSession();
      
      setAuthState({
        user: session?.user || null,
        session,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: {
          message: 'Failed to initialize authentication',
          code: 'INIT_ERROR',
        },
      });
    }
  }, []);

  /**
   * Sign in with email and password
   */
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const session = await authService.signInWithEmail(email, password);
      
      setAuthState({
        user: session.user,
        session,
        loading: false,
        error: null,
      });
      
      return session;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: authError,
      }));
      throw error;
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signUpWithEmail = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const session = await authService.signUpWithEmail(email, password, metadata);
      
      setAuthState({
        user: session.user,
        session,
        loading: false,
        error: null,
      });
      
      return session;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: authError,
      }));
      throw error;
    }
  }, []);

  /**
   * Sign in with Google
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const session = await authService.signInWithGoogle();
      
      setAuthState({
        user: session.user,
        session,
        loading: false,
        error: null,
      });
      
      return session;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: authError,
      }));
      throw error;
    }
  }, []);

  /**
   * Sign in with Facebook
   */
  const signInWithFacebook = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const session = await authService.signInWithFacebook();
      
      setAuthState({
        user: session.user,
        session,
        loading: false,
        error: null,
      });
      
      return session;
    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: authError,
      }));
      throw error;
    }
  }, []);

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      await authService.signOut();
      
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if sign out fails, clear local state
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    }
  }, []);

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(async () => {
    try {
      const session = await authService.refreshToken();
      
      if (session) {
        setAuthState(prev => ({
          ...prev,
          user: session.user,
          session,
          error: null,
        }));
        return session;
      } else {
        // If refresh fails, sign out
        await signOut();
        return null;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await signOut();
      return null;
    }
  }, [signOut]);

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = authState.session !== null && authState.user !== null;

  /**
   * Check if token is expired
   */
  const isTokenExpired = authState.session ? authService.isTokenExpired(authState.session) : false;

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (authState.session && isTokenExpired) {
      refreshToken();
    }
  }, [authState.session, isTokenExpired, refreshToken]);

  return {
    // State
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated,
    isTokenExpired,

    // Actions
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    refreshToken,
    clearError,
    initializeAuth,
  };
}