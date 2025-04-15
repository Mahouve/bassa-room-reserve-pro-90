
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

// This page will redirect to the login page
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page after a brief delay
    const timer = setTimeout(() => {
      navigate('/');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center animate-fade-in">
        <Logo className="mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4">PERENCO - Foyer Bassa</h1>
        <p className="text-xl text-gray-600 mb-8">Système de réservation de salles</p>
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-perenco-accent" />
        </div>
        <p className="mt-4 text-gray-500">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default Index;
