
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import axios from 'axios';
import { API_CONFIG } from '@/config';

// Mimic the Supabase types for backward compatibility
type User = {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    location?: string;
    bio?: string;
    [key: string]: any;
  };
};

type Session = {
  access_token: string;
  expires_at: number;
  user: User;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance with timeout and better error handling
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper function to check if token is expired
  const isTokenExpired = (expiresAt: number) => {
    return Date.now() >= expiresAt * 1000;
  };

  // Handle session from localStorage on init
  useEffect(() => {
    const storedSession = localStorage.getItem('session');
    
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession) as Session;
        
        // Check if token is expired
        if (parsedSession.expires_at && !isTokenExpired(parsedSession.expires_at)) {
          setSession(parsedSession);
          setUser(parsedSession.user);
          
          // Set axios auth header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${parsedSession.access_token}`;
        } else {
          // Clear expired session
          localStorage.removeItem('session');
        }
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('session');
      }
    }
    
    setLoading(false);
  }, []);

  const formatErrorMessage = (error: any): string => {
    console.error('Error details:', error);
    
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    } else if (error.message === 'Network Error') {
      return 'Unable to connect to the server. Please check your internet connection or try again later.';
    } else if (error.code === 'ECONNABORTED') {
      return 'Server request timed out. Please try again later.';
    } else if (error.response?.status === 401) {
      return 'Invalid email or password. Please try again.';
    } else if (error.response?.status === 422) {
      return 'Invalid input data. Please check your information and try again.';
    } else if (error.response?.status === 404) {
      return 'The requested resource was not found. Please try again.';
    } else {
      return error.message || 'An unknown error occurred';
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      console.log('Attempting to sign in with URL:', API_CONFIG.baseURL);
      
      // Use token endpoint to get access token (OAuth2 password flow)
      const response = await apiClient.post('/token', 
        new URLSearchParams({
          'username': email,
          'password': password,
          'grant_type': 'password'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      const { access_token, token_type } = response.data;
      
      // Set auth header for subsequent requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user data
      const userResponse = await apiClient.get('/auth/me');
      const userData = userResponse.data;
      
      // Create session object (similar to Supabase)
      const newSession: Session = {
        access_token,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
        user: userData
      };
      
      // Store in localStorage
      localStorage.setItem('session', JSON.stringify(newSession));
      
      setSession(newSession);
      setUser(userData);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: formatErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      console.log('Attempting to register with URL:', `${API_CONFIG.baseURL}/auth/register`);
      
      await apiClient.post('/auth/register', {
        email,
        password,
        name
      });
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully. Please check your email for a verification link.",
      });
      
      sonnerToast.success("Verification email sent", {
        description: "Please check your inbox and verify your email address before signing in.",
        duration: 6000
      });
      
      navigate('/verify-email?email=' + encodeURIComponent(email));
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: formatErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Clear auth header
      delete apiClient.defaults.headers.common['Authorization'];
      
      // Clear stored session
      localStorage.removeItem('session');
      
      // Reset state
      setSession(null);
      setUser(null);
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: formatErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
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
