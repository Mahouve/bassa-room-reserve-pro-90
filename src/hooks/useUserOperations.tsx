
import { useState } from 'react';
import { User, Role } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UserOperationsHook {
  loading: boolean;
  createUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (id: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  getUserById: (id: string, users: User[]) => User | undefined;
  searchUsers: (query: string, users: User[]) => User[];
}

export const useUserOperations = (): UserOperationsHook => {
  const [loading, setLoading] = useState<boolean>(false);

  const createUser = async (userData: Partial<User>): Promise<User> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          first_name: userData.prenom || '',
          last_name: userData.nom || '',
          phone: userData.telephone || '',
          role: userData.role || 'utilisateur',
          department: '', // Default empty department
          location: '', // Default empty location
          joined_date: new Date().toISOString(),
          last_active: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de créer l\'utilisateur. ' + error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Create user object from the response
      const user: User = {
        id: data.id,
        nom: data.last_name || '',
        prenom: data.first_name || '',
        email: data.id, // Using ID as email for demo
        telephone: data.phone || '',
        role: (data.role as Role) || 'utilisateur',
        statut: 'PERENCO', // Default status
        date_creation: data.joined_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      };
      
      toast({
        title: 'Utilisateur créé',
        description: `${user.prenom} ${user.nom} a été créé avec succès.`,
      });
      
      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, userData: Partial<User>): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.prenom,
          last_name: userData.nom,
          phone: userData.telephone,
          role: userData.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating user:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour l\'utilisateur. ' + error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer l\'utilisateur. ' + error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserById = (id: string, users: User[]): User | undefined => {
    return users.find(user => user.id === id);
  };

  const searchUsers = (query: string, users: User[]): User[] => {
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user => 
      user.nom.toLowerCase().includes(lowercaseQuery) ||
      user.prenom.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    loading,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    searchUsers
  };
};
