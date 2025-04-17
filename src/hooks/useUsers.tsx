
import { useState, useEffect } from 'react';
import { User, Role, UserStatus, Sponsorship } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Initial empty state
const EMPTY_USERS: User[] = [];
const EMPTY_SPONSORSHIPS: Sponsorship[] = [];

interface UsersHook {
  users: User[];
  sponsorships: Sponsorship[];
  loading: boolean;
  createUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (id: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  createSponsorship: (sponsorshipData: Partial<Sponsorship>) => Promise<Sponsorship>;
  updateSponsorshipStatus: (id: string, newStatus: 'en attente' | 'validé' | 'refusé') => Promise<boolean>;
  getUserById: (id: string) => User | undefined;
  searchUsers: (query: string) => User[];
}

export const useUsers = (): UsersHook => {
  const [users, setUsers] = useState<User[]>(EMPTY_USERS);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>(EMPTY_SPONSORSHIPS);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch users and sponsorships from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Attempt to fetch users from profiles table
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          toast({
            title: 'Erreur',
            description: 'Impossible de récupérer la liste des utilisateurs.',
            variant: 'destructive',
          });
        } else if (profilesData) {
          // Map profiles data to our User type
          const fetchedUsers: User[] = profilesData.map(profile => ({
            id: profile.id,
            nom: profile.last_name || '',
            prenom: profile.first_name || '',
            email: profile.id, // Using ID as email for demo
            telephone: profile.phone || '',
            role: (profile.role as Role) || 'utilisateur',
            statut: 'PERENCO', // Default status
            date_creation: profile.joined_date || new Date().toISOString().split('T')[0],
          }));
          
          setUsers(fetchedUsers);
        }

        // Attempt to fetch sponsorships from sponsorships table
        const { data: sponsorshipsData, error: sponsorshipsError } = await supabase
          .from('sponsorships')
          .select('*');
        
        if (sponsorshipsError) {
          console.error('Error fetching sponsorships:', sponsorshipsError);
        } else if (sponsorshipsData) {
          // Map sponsorships data to our Sponsorship type
          const fetchedSponsorships: Sponsorship[] = sponsorshipsData.map(sponsorship => ({
            id: sponsorship.id,
            utilisateur_id: sponsorship.sponsor_id,
            nom_parraine: sponsorship.guest_name,
            contact_parraine: sponsorship.guest_email,
            statut_validation: sponsorship.status as 'en attente' | 'validé' | 'refusé',
          }));
          
          setSponsorships(fetchedSponsorships);
        }
      } catch (error) {
        console.error('Error in fetch operation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up real-time subscription
    const usersChannel = supabase
      .channel('schema-db-changes-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Profiles change detected:', payload);
          // Refresh data when changes occur
          fetchData();
        }
      )
      .subscribe();
      
    const sponsorshipsChannel = supabase
      .channel('schema-db-changes-sponsorships')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sponsorships' },
        (payload) => {
          console.log('Sponsorships change detected:', payload);
          // Refresh data when changes occur
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(sponsorshipsChannel);
    };
  }, []);

  const createUser = async (userData: Partial<User>): Promise<User> => {
    setLoading(true);
    
    try {
      // Fix the TypeScript error by not specifying 'id' as Supabase will generate it
      // Also use .insert() with an object, not an array of objects
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
          // Remove the 'id' field, as Supabase will generate it automatically
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
      
      // Update local state
      setUsers(prevUsers => [...prevUsers, user]);
      
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
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === id ? { ...user, ...userData } : user
        )
      );
      
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
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      
      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createSponsorship = async (sponsorshipData: Partial<Sponsorship>): Promise<Sponsorship> => {
    setLoading(true);
    
    try {
      // Create sponsorship in Supabase
      const { data, error } = await supabase
        .from('sponsorships')
        .insert([{
          sponsor_id: sponsorshipData.utilisateur_id || '',
          guest_name: sponsorshipData.nom_parraine || '',
          guest_email: sponsorshipData.contact_parraine || '',
          status: 'en attente',
          event_type: 'visit', // Default event type
          department_sponsor: 'Unknown', // Default department
          guest_company: 'Unknown', // Default company
          event_date: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating sponsorship:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de créer le parrainage. ' + error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Create sponsorship object from the response
      const sponsorship: Sponsorship = {
        id: data.id,
        utilisateur_id: data.sponsor_id,
        nom_parraine: data.guest_name,
        contact_parraine: data.guest_email,
        statut_validation: data.status as 'en attente' | 'validé' | 'refusé',
      };
      
      // Update local state
      setSponsorships(prevSponsorships => [...prevSponsorships, sponsorship]);
      
      toast({
        title: 'Parrainage créé',
        description: `Le parrainage de ${sponsorship.nom_parraine} a été créé avec succès.`,
      });
      
      return sponsorship;
    } catch (error) {
      console.error('Error in createSponsorship:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSponsorshipStatus = async (id: string, newStatus: 'en attente' | 'validé' | 'refusé'): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('sponsorships')
        .update({
          status: newStatus,
          validation_date: newStatus !== 'en attente' ? new Date().toISOString() : null,
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating sponsorship status:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour le statut du parrainage. ' + error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Update local state
      setSponsorships(prevSponsorships => 
        prevSponsorships.map(sponsorship => 
          sponsorship.id === id ? { ...sponsorship, statut_validation: newStatus } : sponsorship
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error in updateSponsorshipStatus:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const searchUsers = (query: string): User[] => {
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user => 
      user.nom.toLowerCase().includes(lowercaseQuery) ||
      user.prenom.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    users,
    sponsorships,
    loading,
    createUser,
    updateUser,
    deleteUser,
    createSponsorship,
    updateSponsorshipStatus,
    getUserById,
    searchUsers
  };
};
