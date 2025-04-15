
import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isAdminOrManager = isAdmin || isManager;
  
  // Get the initials from the user's name
  const getInitials = (user: any) => {
    if (!user) return 'U';
    return (user.prenom.charAt(0) + user.nom.charAt(0)).toUpperCase();
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { 
      to: '/dashboard', 
      label: 'Tableau de bord', 
      icon: <Home className="h-5 w-5" />,
      showFor: ['admin', 'manager', 'utilisateur', 'invité'] 
    },
    { 
      to: '/reservations', 
      label: 'Réservations', 
      icon: <Calendar className="h-5 w-5" />,
      showFor: ['admin', 'manager', 'utilisateur', 'invité'] 
    },
    { 
      to: '/utilisateurs', 
      label: 'Utilisateurs', 
      icon: <Users className="h-5 w-5" />,
      showFor: ['admin', 'manager'] 
    },
    { 
      to: '/parrainages', 
      label: 'Parrainages', 
      icon: <FileText className="h-5 w-5" />,
      showFor: ['admin', 'manager', 'utilisateur'] 
    },
    { 
      to: '/paiements', 
      label: 'Paiements', 
      icon: <CreditCard className="h-5 w-5" />,
      showFor: ['admin', 'manager'] 
    },
    { 
      to: '/parametres', 
      label: 'Paramètres', 
      icon: <Settings className="h-5 w-5" />,
      showFor: ['admin', 'manager', 'utilisateur', 'invité'] 
    },
  ];

  if (!user) {
    // Redirect to login if no user
    navigate('/');
    return null;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between">
        <Logo />
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100">
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:sticky top-0 left-0 z-30 
          h-full w-64 bg-white shadow-lg p-4 flex flex-col
        `}
      >
        <div className="py-4 flex items-center justify-center mb-8">
          <Logo />
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems
              .filter(item => item.showFor.includes(user?.role || 'invité'))
              .map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    className={`
                      flex items-center px-4 py-3 rounded-lg transition-colors
                      ${location.pathname === item.to 
                        ? 'bg-perenco-accent text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center px-4 py-3">
            <Avatar>
              <AvatarFallback className="bg-perenco-accent text-white">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.prenom} {user?.nom}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto" 
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {/* Main content wrapper */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="p-4 bg-white shadow-inner text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} PERENCO - Foyer Bassa</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
