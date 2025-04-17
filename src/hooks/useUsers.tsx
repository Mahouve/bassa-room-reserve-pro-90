
import { User, Sponsorship } from '@/types';
import { useUserData } from '@/hooks/useUserData';
import { useUserOperations } from '@/hooks/useUserOperations';
import { useSponsorshipOperations } from '@/hooks/useSponsorshipOperations';

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
  const { users, sponsorships, loading: dataLoading } = useUserData();
  const { 
    loading: userOpLoading, 
    createUser, 
    updateUser, 
    deleteUser, 
    getUserById: getUser, 
    searchUsers: searchUsersList 
  } = useUserOperations();
  const { 
    loading: sponsorshipOpLoading, 
    createSponsorship, 
    updateSponsorshipStatus 
  } = useSponsorshipOperations();

  // Combine loading states
  const loading = dataLoading || userOpLoading || sponsorshipOpLoading;

  // Adapt the getUserById to not need the users array as an argument
  const getUserById = (id: string): User | undefined => {
    return getUser(id, users);
  };

  // Adapt the searchUsers to not need the users array as an argument
  const searchUsers = (query: string): User[] => {
    return searchUsersList(query, users);
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
