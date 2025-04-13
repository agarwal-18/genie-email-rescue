
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

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
  }
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

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
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
      
      let errorMessage = "An error occurred during sign in.";
      
      // Check for specific error messages from the API
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
        
        // Add specific messaging for email verification
        if (errorMessage.includes("Email not verified") || 
            errorMessage.includes("email has not been confirmed")) {
          errorMessage = "Please verify your email before signing in. Check your inbox and spam folder for the verification link.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log("Attempting to register user:", { email, name });
      
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        name
      });
      
      console.log("Registration response:", response.data);
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully. Please check your email for a verification link.",
      });
      
      sonnerToast.success("Verification email sent", {
        description: "Please check your inbox and spam folder for the verification email.",
        duration: 8000
      });
      
      return;
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = "An error occurred during sign up.";
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
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
        description: error.message || "An error occurred during sign out.",
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
