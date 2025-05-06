
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User, UserStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{success: boolean, message?: string}>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing session on load
    const checkSession = async () => {
      setIsLoading(true);
      
      // Check if user is already signed in
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        // User is signed in, get their profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          // Map profile to our User type
          const userData: User = {
            id: profile.id,
            nom: profile.last_name || '',
            prenom: profile.first_name || '',
            email: session.user.email || '',
            telephone: profile.phone || '',
            role: (profile.role as Role) || 'utilisateur',
            statut: 'PERENCO' as UserStatus,
            date_creation: profile.joined_date?.split('T')[0] || new Date().toISOString().split('T')[0],
          };
          
          setUser(userData);
        } else if (profileError) {
          console.error('Error fetching user profile:', profileError);
        }
      }
      
      setIsLoading(false);
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile data
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            // Map profile to our User type
            const userData: User = {
              id: profile.id,
              nom: profile.last_name || '',
              prenom: profile.first_name || '',
              email: session.user.email || '',
              telephone: profile.phone || '',
              role: (profile.role as Role) || 'utilisateur',
              statut: 'PERENCO' as UserStatus,
              date_creation: profile.joined_date?.split('T')[0] || new Date().toISOString().split('T')[0],
            };
            
            setUser(userData);
          } else if (profileError) {
            console.error('Error fetching user profile:', profileError);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Attempt to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Identifiants invalides';
        if (error.message === 'Email not confirmed') {
          errorMessage = 'Email non confirmé. Veuillez vérifier votre boîte de réception.';
        } else if (error.message === 'Invalid login credentials') {
          errorMessage = 'Email ou mot de passe incorrect';
        }
        
        setIsLoading(false);
        return { success: false, message: errorMessage };
      }
      
      // Successfully logged in, user data will be set by the auth state listener
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, message: 'Une erreur est survenue lors de la connexion' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Sign out with Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la déconnexion',
          variant: 'destructive',
        });
      } else {
        // Successfully logged out
        setUser(null);
        toast({
          title: 'Déconnexion réussie',
        });
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la déconnexion',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    
    try {
      // Create new user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email || '',
        password: userData.password,
      });
      
      if (error) {
        console.error('Registration error:', error);
        toast({
          title: 'Échec de l\'inscription',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return false;
      }
      
      if (data.user) {
        // Create profile record for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: userData.prenom || '',
            last_name: userData.nom || '',
            phone: userData.telephone || '',
            role: userData.role || 'utilisateur',
            joined_date: new Date().toISOString(),
          });
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast({
            title: 'Erreur de profil',
            description: 'Compte créé mais erreur lors de la création du profil',
            variant: 'destructive',
          });
        }
        
        toast({
          title: 'Inscription réussie',
          description: 'Votre compte a été créé avec succès',
        });
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'inscription',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
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
