
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading, user } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  
  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await login(loginData.email, loginData.password);
      
      if (success) {
        toast({
          title: 'Connexion réussie',
          description: 'Vous êtes maintenant connecté à votre compte.',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Erreur de connexion',
          description: 'Adresse e-mail ou mot de passe incorrect.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: 'Une erreur est survenue lors de la connexion.',
        variant: 'destructive',
      });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Erreur d\'inscription',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const success = await register({
        nom: registerData.nom,
        prenom: registerData.prenom,
        email: registerData.email,
        telephone: registerData.telephone,
        password: registerData.password,
        role: 'utilisateur',
        statut: 'PERENCO',
      });
      
      if (success) {
        toast({
          title: 'Inscription réussie',
          description: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
        });
        // Reset form and switch to login tab
        setRegisterData({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          password: '',
          confirmPassword: '',
        });
        document.getElementById('login-tab')?.click();
      } else {
        toast({
          title: 'Erreur d\'inscription',
          description: 'Une erreur est survenue lors de l\'inscription.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur d\'inscription',
        description: 'Une erreur est survenue lors de l\'inscription.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-perenco-dark">Foyer Bassa</h1>
          <p className="text-gray-600">Système de réservation de salle</p>
        </div>

        <Card className="w-full shadow-lg">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger id="login-tab" value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit}>
                <CardHeader>
                  <CardTitle>Connexion</CardTitle>
                  <CardDescription>
                    Accédez à votre compte PERENCO Foyer Bassa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Adresse e-mail</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="votre.email@perenco.com" 
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-perenco-accent hover:bg-perenco-accent/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                  
                  <div className="text-center text-xs text-gray-500 mt-4">
                    <p>Identifiants de test:</p>
                    <p>Admin: admin@perenco.com / admin123</p>
                    <p>Manager: manager@perenco.com / manager123</p>
                    <p>Utilisateur: user@perenco.com / user123</p>
                  </div>
                </CardContent>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit}>
                <CardHeader>
                  <CardTitle>Inscription</CardTitle>
                  <CardDescription>
                    Créez un nouveau compte PERENCO Foyer Bassa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-nom">Nom</Label>
                      <Input 
                        id="register-nom" 
                        value={registerData.nom}
                        onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-prenom">Prénom</Label>
                      <Input 
                        id="register-prenom" 
                        value={registerData.prenom}
                        onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Adresse e-mail</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="votre.email@perenco.com" 
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-telephone">Numéro de téléphone</Label>
                    <Input 
                      id="register-telephone" 
                      type="tel" 
                      placeholder="+237 6XX XXX XXX" 
                      value={registerData.telephone}
                      onChange={(e) => setRegisterData({ ...registerData, telephone: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Mot de passe</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirmez le mot de passe</Label>
                      <Input 
                        id="register-confirm-password" 
                        type="password" 
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-perenco-accent hover:bg-perenco-accent/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription en cours...
                      </>
                    ) : (
                      'S\'inscrire'
                    )}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
        
        <p className="text-center text-sm text-gray-500 mt-4">
          © {new Date().getFullYear()} PERENCO - Foyer Bassa. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default Login;
