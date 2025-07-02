import { supabase } from './supabase';
import { storageService } from './storage';
import { User, AuthError, OAuthProvider } from '@/types/auth';
import type { AuthSession } from '@/types/auth';
import * as ExpoAuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

class AuthService {
  private readonly STORAGE_KEYS = {
    SESSION: 'auth_session',
    USER: 'user_data',
    REFRESH_TOKEN: 'refresh_token',
  };

  // OAuth Providers Configuration
  private readonly oauthProviders: Record<string, OAuthProvider> = {
    google: {
      name: 'google',
      displayName: 'Google',
      icon: 'https://developers.google.com/identity/images/g-logo.png',
    },
    facebook: {
      name: 'facebook',
      displayName: 'Facebook',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    },
  };

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthSession> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw this.createAuthError(error.message, error.status);
      }

      if (!data.session || !data.user) {
        throw this.createAuthError('Authentication failed');
      }

      const authSession = await this.createAuthSession(data.session, data.user);
      await this.storeSession(authSession);
      
      return authSession;
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, metadata?: any): Promise<AuthSession> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw this.createAuthError(error.message, error.status);
      }

      if (!data.session || !data.user) {
        throw this.createAuthError('Registration failed');
      }

      const authSession = await this.createAuthSession(data.session, data.user);
      await this.storeSession(authSession);
      
      return authSession;
    } catch (error) {
      console.error('Email sign-up error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<AuthSession> {
    try {
      const redirectUrl = ExpoAuthSession.makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'email profile',
        },
      });

      if (error) {
        throw this.createAuthError(error.message);
      }

      // For web platform, handle the OAuth flow differently
      if (Platform.OS === 'web') {
        return this.handleWebOAuth(data.url);
      }

      // For mobile, use expo-auth-session
      return this.handleMobileOAuth(data.url, 'google');
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Facebook OAuth
   */
  async signInWithFacebook(): Promise<AuthSession> {
    try {
      const redirectUrl = ExpoAuthSession.makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
          scopes: 'email public_profile',
        },
      });

      if (error) {
        throw this.createAuthError(error.message);
      }

      // For web platform, handle the OAuth flow differently
      if (Platform.OS === 'web') {
        return this.handleWebOAuth(data.url);
      }

      // For mobile, use expo-auth-session
      return this.handleMobileOAuth(data.url, 'facebook');
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      throw error;
    }
  }

  /**
   * Handle web OAuth flow
   */
  private async handleWebOAuth(url: string): Promise<AuthSession> {
    // For web, redirect to the OAuth URL
    window.location.href = url;
    
    // This will be handled by the redirect callback
    throw new Error('OAuth redirect initiated');
  }

  /**
   * Handle mobile OAuth flow
   */
  private async handleMobileOAuth(url: string, provider: string): Promise<AuthSession> {
    const result = await WebBrowser.openAuthSessionAsync(url, ExpoAuthSession.makeRedirectUri());

    if (result.type === 'success') {
      // Extract the session from the URL
      // Note: getSessionFromUrl might not be available in your Supabase version
      // We need to implement a custom solution or use a different approach
      const params = new URLSearchParams(result.url.split('#')[1]);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      
      if (!access_token) {
        throw this.createAuthError(`${provider} authentication failed - no access token`);
      }

      // Set the session in Supabase using the tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: access_token,
        refresh_token: refresh_token || '',
      });

      if (error) {
        throw this.createAuthError(error.message);
      }

      if (!data.session || !data.user) {
        throw this.createAuthError(`${provider} authentication failed`);
      }

      const authSession = await this.createAuthSession(data.session, data.user);
      await this.storeSession(authSession);
      
      return authSession;
    }

    throw this.createAuthError(`${provider} authentication was cancelled`);
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }

      // Clear stored session regardless of Supabase response
      await this.clearStoredSession();
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local session even if remote sign out fails
      await this.clearStoredSession();
      throw error;
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      // First try to get from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Get session error:', error);
        return null;
      }

      if (session && session.user) {
        const authSession = await this.createAuthSession(session, session.user);
        await this.storeSession(authSession);
        return authSession;
      }

      // Fallback to stored session
      return this.getStoredSession();
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthSession | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Token refresh error:', error);
        await this.clearStoredSession();
        return null;
      }

      if (!data.session || !data.user) {
        await this.clearStoredSession();
        return null;
      }

      const authSession = await this.createAuthSession(data.session, data.user);
      await this.storeSession(authSession);
      
      return authSession;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.clearStoredSession();
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(session: AuthSession): boolean {
    const now = Math.floor(Date.now() / 1000);
    const buffer = 300; // 5 minutes buffer
    return session.expires_at <= (now + buffer);
  }

  /**
   * Get stored session from local storage
   */
  private async getStoredSession(): Promise<AuthSession | null> {
    try {
      const sessionData = await storageService.getItem(this.STORAGE_KEYS.SESSION);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting stored session:', error);
      return null;
    }
  }

  /**
   * Store session in local storage
   */
  private async storeSession(session: AuthSession): Promise<void> {
    try {
      await storageService.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(session));
      await storageService.setItem(this.STORAGE_KEYS.USER, JSON.stringify(session.user));
      await storageService.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, session.refresh_token);
    } catch (error) {
      console.error('Error storing session:', error);
      throw error;
    }
  }

  /**
   * Clear stored session
   */
  private async clearStoredSession(): Promise<void> {
    try {
      await Promise.all([
        storageService.removeItem(this.STORAGE_KEYS.SESSION),
        storageService.removeItem(this.STORAGE_KEYS.USER),
        storageService.removeItem(this.STORAGE_KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error('Error clearing stored session:', error);
    }
  }

  /**
   * Create auth session object
   */
  private async createAuthSession(session: any, user: any): Promise<AuthSession> {
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        phone: user.phone,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  }

  /**
   * Create standardized auth error
   */
  private createAuthError(message: string, status?: number): AuthError {
    return {
      message,
      status: status || 400,
      code: 'AUTH_ERROR',
    };
  }

  /**
   * Get available OAuth providers
   */
  getOAuthProviders(): OAuthProvider[] {
    return Object.values(this.oauthProviders);
  }
}

export const authService = new AuthService();