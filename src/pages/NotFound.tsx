
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Logo from '@/components/Logo';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Logo className="mb-8" />
      
      <div className="w-full max-w-md text-center space-y-6 animate-fade-in">
        <h1 className="text-7xl font-bold text-perenco-dark">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700">Page non trouvée</h2>
        <p className="text-gray-600">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="pt-6">
          <Link to="/dashboard">
            <Button className="bg-perenco-accent hover:bg-perenco-accent/90">
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
      
      <p className="text-center text-sm text-gray-500 mt-12">
        © {new Date().getFullYear()} PERENCO - Foyer Bassa. Tous droits réservés.
      </p>
    </div>
  );
};

export default NotFound;
