export interface AuthUser {
  id: string;
  email?: string;
  avatarUrl?: string;
  name?: string;
}

export interface SignInFormData {
  email: string;
  password?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;
}

export type AuthProvider = 'github' | 'email';

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;
  signIn: (provider?: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
} 
