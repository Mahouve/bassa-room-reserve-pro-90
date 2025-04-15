
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User, UserStatus } from '@/types';

// Sample users for demonstration
const MOCK_USERS = [
  {
    id: '1',
    nom: 'Admin',
    prenom: 'User',
    email: 'admin@perenco.com',
    telephone: '+237612345678',
    role: 'admin' as Role,
    statut: 'PERENCO' as UserStatus,
    password: 'admin123', // In a real app, this would be hashed
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
    password: 'manager123', // In a real app, this would be hashed
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
    password: 'user123', // In a real app, this would be hashed
    date_creation: '2023-01-03'
  },
];

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for saved authentication in localStorage
    const savedUser = localStorage.getItem('perenco-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user with matching email and password
    const foundUser = MOCK_USERS.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (foundUser) {
      // Remove password before storing user data
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('perenco-user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('perenco-user');
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists
    const emailExists = MOCK_USERS.some(
      u => u.email.toLowerCase() === userData.email?.toLowerCase()
    );
    
    if (emailExists) {
      setIsLoading(false);
      return false;
    }
    
    // In a real app, this would create a new user in the database
    // For demo purposes, we'll just pretend it succeeded
    
    setIsLoading(false);
    return true;
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
