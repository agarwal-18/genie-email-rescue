import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  getAccessToken: () => string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          const sessionObj = {
            access_token: session.access_token,
            expires_at: Math.floor(new Date(session.expires_at || 0).getTime() / 1000),
            user: {
              id: session.user.id,
              email: session.user.email || '',
              created_at: session.user.created_at || new Date().toISOString(),
              user_metadata: session.user.user_metadata
            }
          };
          setSession(sessionObj);
          setUser(sessionObj.user);
        } else {
          setSession(null);
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const sessionObj = {
          access_token: session.access_token,
          expires_at: Math.floor(new Date(session.expires_at || 0).getTime() / 1000),
          user: {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at || new Date().toISOString(),
            user_metadata: session.user.user_metadata
          }
        };
        setSession(sessionObj);
        setUser(sessionObj.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to get current access token
  const getAccessToken = (): string | null => {
    if (session && session.access_token) {
      return session.access_token;
    }
    return null;
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Use Supabase directly for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.session) {
        const sessionObj = {
          access_token: data.session.access_token,
          expires_at: Math.floor(new Date(data.session.expires_at || 0).getTime() / 1000),
          user: {
            id: data.user.id,
            email: data.user.email || '',
            created_at: data.user.created_at || new Date().toISOString(),
            user_metadata: data.user.user_metadata
          }
        };
        
        setSession(sessionObj);
        setUser(sessionObj.user);
        
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        
        navigate('/');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = "An error occurred during sign in.";
      
      if (error.message) {
        errorMessage = error.message;
        
        // Add specific messaging for email verification
        if (errorMessage.includes("Email not confirmed") || 
            errorMessage.includes("email has not been confirmed")) {
          errorMessage = "Please verify your email before signing in. Check your inbox and spam folder for the verification link.";
        }
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
      
      // Use Supabase directly for registration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      console.log("Registration response:", data);
      
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
      
      if (error.message) {
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
      
      // Use Supabase directly for sign out
      await supabase.auth.signOut();
      
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
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, getAccessToken }}>
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
