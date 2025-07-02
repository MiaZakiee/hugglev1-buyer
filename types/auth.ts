export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

export interface OAuthProvider {
  name: 'google' | 'facebook';
  displayName: string;
  icon: string;
}

export interface AuthState {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
}