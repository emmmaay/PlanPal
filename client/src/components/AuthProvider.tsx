import { useState, useEffect, createContext } from 'react';
import { AuthContext, type AuthContextType, type User, type Role, type CourseMembership } from '@/lib/auth';
import { supabase, type SupabaseUser } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [memberships, setMemberships] = useState<CourseMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Listen for authentication state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuthSuccess(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await handleAuthSuccess(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRoles([]);
        setMemberships([]);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await handleAuthSuccess(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = async (supabaseUser: SupabaseUser) => {
    try {
      // Get user data from our backend (which will create the user if needed)
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setRoles(data.roles || []);
          setMemberships(data.memberships || []);
        } else {
          console.error('Failed to fetch user data from backend');
          setUser(null);
          setRoles([]);
          setMemberships([]);
        }
      }
    } catch (error) {
      console.error('Error handling auth success:', error);
      setUser(null);
      setRoles([]);
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: `Hello ${data.user.email}`,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        toast({
          title: "Welcome to YCT ND1 Computer Science!",
          description: data.user.email_confirmed_at 
            ? `Account created for ${username}` 
            : "Please check your email to confirm your account",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasRole = (roleType: string): boolean => {
    return roles.some(role => role.roleType === roleType);
  };

  const isCourseAdmin = (courseId: string): boolean => {
    if (user?.isCreator || hasRole('top_admin')) return true;
    return roles.some(role => role.roleType === 'course_admin' && role.scope === courseId);
  };

  const value: AuthContextType = {
    user,
    roles,
    memberships,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasRole,
    isCourseAdmin,
    isTopAdmin: user?.isCreator || hasRole('top_admin'),
    isCreator: user?.isCreator || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}