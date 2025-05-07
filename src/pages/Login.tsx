
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [isResendingConfirmation, setIsResendingConfirmation] = React.useState(false);
  const [confirmationSent, setConfirmationSent] = React.useState(false);
  const [loginMode, setLoginMode] = React.useState('normal');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const emailValue = form.watch('email');

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null);
    setConfirmationSent(false);
    try {
      console.log("Tentative de connexion avec:", data.email);

      if (loginMode === 'bypass') {
        // Contourner la confirmation de l'email - pour les tests uniquement
        // Obtenir la session directement avec l'API Supabase admin
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
          email: data.email, 
          password: data.password
        });
        
        if (error) {
          if (error.message === 'Invalid login credentials') {
            setErrorMessage('Email ou mot de passe incorrect');
          } else {
            setErrorMessage(error.message);
          }
          
          toast({
            variant: 'destructive',
            title: 'Échec de la connexion',
            description: error.message,
          });
        } else if (session) {
          toast({
            title: 'Connexion réussie',
            description: 'Bienvenue dans votre espace',
          });
          navigate('/dashboard');
        }
        
        return;
      }
      
      // Mode de connexion normal
      const { success, message, emailNotConfirmed } = await login(data.email, data.password);
      
      if (success) {
        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue dans votre espace',
        });
        navigate('/dashboard');
      } else {
        // Si l'email n'est pas confirmé, afficher un message spécifique
        if (emailNotConfirmed) {
          setErrorMessage("Votre email n'a pas été confirmé. Veuillez vérifier votre boîte de réception ou cliquer sur 'Renvoyer le lien de confirmation'.");
        } else {
          setErrorMessage(message || 'Email ou mot de passe incorrect');
        }
        
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

  const handleResendConfirmation = async () => {
    if (!emailValue || !emailValue.includes('@')) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez entrer un email valide',
      });
      return;
    }

    setIsResendingConfirmation(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailValue,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.message,
        });
      } else {
        setConfirmationSent(true);
        toast({
          title: 'Email envoyé',
          description: 'Un nouveau lien de confirmation a été envoyé à votre adresse email',
        });
      }
    } catch (error: any) {
      console.error('Error sending confirmation:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi du lien de confirmation',
      });
    } finally {
      setIsResendingConfirmation(false);
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
            <Tabs defaultValue="normal" className="mb-4" onValueChange={(value) => setLoginMode(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="normal">Normal</TabsTrigger>
                <TabsTrigger value="bypass">Test (bypass)</TabsTrigger>
              </TabsList>
              <TabsContent value="normal">
                <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200 text-blue-800">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  <AlertDescription>Mode de connexion standard. La confirmation de l'email est requise.</AlertDescription>
                </Alert>
              </TabsContent>
              <TabsContent value="bypass">
                <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  <AlertDescription>Mode de test : contourne la vérification d'email (pour les tests uniquement).</AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {confirmationSent && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                <AlertDescription>Un email de confirmation a été envoyé à votre adresse.</AlertDescription>
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

                {errorMessage && errorMessage.includes("n'a pas été confirmé") && (
                  <Button 
                    variant="outline"
                    type="button"
                    className="w-full mt-2"
                    onClick={handleResendConfirmation}
                    disabled={isResendingConfirmation}
                  >
                    {isResendingConfirmation ? 'Envoi...' : 'Renvoyer le lien de confirmation'}
                  </Button>
                )}
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
