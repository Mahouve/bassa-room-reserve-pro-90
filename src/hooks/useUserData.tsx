
import { useState, useEffect } from 'react';
import { User, Sponsorship, Role } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Initial empty state
const EMPTY_USERS: User[] = [];
const EMPTY_SPONSORSHIPS: Sponsorship[] = [];

interface UserDataHook {
  users: User[];
  sponsorships: Sponsorship[];
  loading: boolean;
}

export const useUserData = (): UserDataHook => {
  const [users, setUsers] = useState<User[]>(EMPTY_USERS);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>(EMPTY_SPONSORSHIPS);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Fetch data on mount
  useEffect(() => {
    fetchData();
    
    // Set up real-time subscription for profiles
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
      
    // Set up real-time subscription for sponsorships  
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

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(sponsorshipsChannel);
    };
  }, []);

  return {
    users,
    sponsorships,
    loading
  };
};
