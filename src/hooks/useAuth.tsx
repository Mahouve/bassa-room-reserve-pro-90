
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User, UserStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{success: boolean, message?: string, emailNotConfirmed?: boolean}>;
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
        console.log("Session trouvée:", session.user.email);
        
        // User is signed in, get their profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          console.log("Profil utilisateur récupéré:", profile);
          
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
      } else {
        console.log("Aucune session active trouvée");
      }
      
      setIsLoading(false);
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("État d'authentification modifié:", event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("Utilisateur connecté:", session.user.email);
          
          // Get user profile data
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            console.log("Profil chargé pour l'utilisateur:", profile);
            
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
          console.log("Utilisateur déconnecté");
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
      console.log(`Tentative de connexion pour ${email}`);
      
      // Always use signInWithPassword directly
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Erreur de connexion:', error);
        
        let errorMessage = 'Identifiants invalides';
        
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
          setIsLoading(false);
          return { success: false, message: errorMessage, emailNotConfirmed: true };
        }
        
        setIsLoading(false);
        return { success: false, message: errorMessage };
      }
      
      if (!data.user) {
        console.error('Aucun utilisateur retourné après connexion');
        setIsLoading(false);
        return { success: false, message: 'Une erreur est survenue lors de la connexion' };
      }
      
      console.log("Connexion réussie pour:", data.user.email);
      
      // Successfully logged in, user data will be set by the auth state listener
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('Erreur de connexion non gérée:', error);
      setIsLoading(false);
      return { success: false, message: 'Une erreur est survenue lors de la connexion' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      console.log("Tentative de déconnexion");
      
      // Sign out with Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur de déconnexion:', error);
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la déconnexion',
          variant: 'destructive',
        });
      } else {
        // Successfully logged out
        console.log("Déconnexion réussie");
        setUser(null);
        toast({
          title: 'Déconnexion réussie',
        });
      }
    } catch (error: any) {
      console.error('Erreur de déconnexion non gérée:', error);
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
      console.log(`Tentative d'inscription pour ${userData.email}`);
      
      // Create new user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email || '',
        password: userData.password,
      });
      
      if (error) {
        console.error("Erreur d'inscription:", error);
        toast({
          title: 'Échec de l\'inscription',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return false;
      }
      
      if (data.user) {
        console.log("Compte créé pour:", data.user.email);
        
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
          console.error('Erreur de création de profil:', profileError);
          toast({
            title: 'Erreur de profil',
            description: 'Compte créé mais erreur lors de la création du profil',
            variant: 'destructive',
          });
        } else {
          console.log("Profil créé avec succès");
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
      console.error("Erreur d'inscription non gérée:", error);
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
