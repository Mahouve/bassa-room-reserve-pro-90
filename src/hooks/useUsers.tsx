
import { useState } from 'react';
import { User, Role, UserStatus, Sponsorship } from '@/types';

// Sample data for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    nom: 'Admin',
    prenom: 'User',
    email: 'admin@perenco.com',
    telephone: '+237612345678',
    role: 'admin' as Role,
    statut: 'PERENCO' as UserStatus,
    date_creation: '2023-01-01'
  },
  {
    id: '2',
    nom: 'Manager',
    prenom: 'User',
    email: 'manager@perenco.com',
    telephone: '+237612345679',
    role: 'manager' as Role,
    statut: 'PERENCO' as UserStatus,
    date_creation: '2023-01-02'
  },
  {
    id: '3',
    nom: 'Normal',
    prenom: 'User',
    email: 'user@perenco.com',
    telephone: '+237612345680',
    role: 'utilisateur' as Role,
    statut: 'PERENCO' as UserStatus,
    date_creation: '2023-01-03'
  },
  {
    id: '4',
    nom: 'Guest',
    prenom: 'User',
    email: 'guest@example.com',
    telephone: '+237612345681',
    role: 'invité' as Role,
    statut: 'parrainé' as UserStatus,
    date_creation: '2023-01-04'
  },
  {
    id: '5',
    nom: 'Contract',
    prenom: 'User',
    email: 'contract@example.com',
    telephone: '+237612345682',
    role: 'utilisateur' as Role,
    statut: 'contractuel' as UserStatus,
    date_creation: '2023-01-05'
  }
];

const MOCK_SPONSORSHIPS: Sponsorship[] = [
  {
    id: '1',
    utilisateur_id: '3',
    nom_parraine: 'John Doe',
    contact_parraine: 'john.doe@example.com',
    statut_validation: 'validé'
  },
  {
    id: '2',
    utilisateur_id: '3',
    nom_parraine: 'Jane Smith',
    contact_parraine: 'jane.smith@example.com',
    statut_validation: 'en attente'
  }
];

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
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>(MOCK_SPONSORSHIPS);
  const [loading, setLoading] = useState<boolean>(false);

  const createUser = async (userData: Partial<User>): Promise<User> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a new ID
    const id = (users.length + 1).toString();
    
    // Create the user
    const user: User = {
      id,
      nom: userData.nom || '',
      prenom: userData.prenom || '',
      email: userData.email || '',
      telephone: userData.telephone || '',
      role: userData.role || 'utilisateur',
      statut: userData.statut || 'PERENCO',
      date_creation: new Date().toISOString().split('T')[0]
    };
    
    // Update users state
    setUsers([...users, user]);
    
    setLoading(false);
    return user;
  };

  const updateUser = async (id: string, userData: Partial<User>): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the user
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === id ? { ...user, ...userData } : user
      )
    );
    
    setLoading(false);
    return true;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Delete the user
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
    
    setLoading(false);
    return true;
  };

  const createSponsorship = async (sponsorshipData: Partial<Sponsorship>): Promise<Sponsorship> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a new ID
    const id = (sponsorships.length + 1).toString();
    
    // Create the sponsorship
    const sponsorship: Sponsorship = {
      id,
      utilisateur_id: sponsorshipData.utilisateur_id || '',
      nom_parraine: sponsorshipData.nom_parraine || '',
      contact_parraine: sponsorshipData.contact_parraine || '',
      statut_validation: 'en attente'
    };
    
    // Update sponsorships state
    setSponsorships([...sponsorships, sponsorship]);
    
    setLoading(false);
    return sponsorship;
  };

  const updateSponsorshipStatus = async (id: string, newStatus: 'en attente' | 'validé' | 'refusé'): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the sponsorship status
    setSponsorships(prevSponsorships => 
      prevSponsorships.map(sponsorship => 
        sponsorship.id === id ? { ...sponsorship, statut_validation: newStatus } : sponsorship
      )
    );
    
    setLoading(false);
    return true;
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
