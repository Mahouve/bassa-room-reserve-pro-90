
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import SupabaseStatus from '@/components/SupabaseStatus';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { InfoIcon } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Veuillez entrer un email valide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null);
    try {
      console.log("Tentative de connexion avec:", data.email);
      
      // Mode de connexion standard (sans vérification d'email)
      const { success, message } = await login(data.email, data.password);
      
      if (success) {
        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue dans votre espace',
        });
        navigate('/dashboard');
      } else {
        setErrorMessage(message || 'Email ou mot de passe incorrect');
        
        toast({
          variant: 'destructive',
          title: 'Échec de la connexion',
          description: message || 'Email ou mot de passe incorrect',
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'Une erreur est survenue lors de la connexion');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la connexion',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto" />
        </div>

        {/* Supabase Connection Status */}
        <div className="mb-6">
          <SupabaseStatus />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Accédez à votre compte pour gérer vos réservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="default" className="mb-4 bg-green-50 border-green-200 text-green-800">
              <InfoIcon className="h-4 w-4 mr-2" />
              <AlertDescription>La vérification d'email a été désactivée pour simplifier le processus de connexion.</AlertDescription>
            </Alert>

            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="votre.email@perenco.com" 
                          type="email" 
                          disabled={isLoading} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••" 
                          type="password" 
                          disabled={isLoading} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  className="w-full bg-perenco-accent hover:bg-perenco-accent-dark" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center w-full text-gray-500">
              Contactez l'administrateur si vous n'avez pas de compte
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
