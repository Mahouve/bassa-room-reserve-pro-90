
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Lock, Bell, Mail, Shield, Settings, Save, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Parametres: React.FC = () => {
  const { user } = useAuth();
  const [accountData, setAccountData] = useState({
    email: user?.email || '',
    telephone: user?.telephone || '',
    notifyEmail: true,
    notifySMS: false,
    darkMode: false,
  });
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const handleAccountChange = (key: string, value: string | boolean) => {
    setAccountData(prev => ({ ...prev, [key]: value }));
  };

  const handleSecurityChange = (key: string, value: string) => {
    setSecurityData(prev => ({ ...prev, [key]: value }));
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Paramètres enregistrés',
      description: 'Vos paramètres de compte ont été mis à jour avec succès.',
    });
    
    setSaving(false);
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }
    
    setSaving(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Mot de passe modifié',
      description: 'Votre mot de passe a été modifié avec succès.',
    });
    
    setSecurityData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    setSaving(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Gérez vos préférences et votre compte</p>
        </div>

        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Compte</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <form onSubmit={handleAccountSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Informations du compte</CardTitle>
                  <CardDescription>
                    Modifiez vos informations personnelles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input id="nom" value={user?.nom} disabled />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input id="prenom" value={user?.prenom} disabled />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={accountData.email}
                      onChange={(e) => handleAccountChange('email', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Numéro de téléphone</Label>
                    <Input 
                      id="telephone" 
                      value={accountData.telephone}
                      onChange={(e) => handleAccountChange('telephone', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Input id="role" value={user?.role} disabled />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut</Label>
                    <Input id="statut" value={user?.statut} disabled />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="ml-auto bg-perenco-accent hover:bg-perenco-accent/90"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
          
          <TabsContent value="security">
            <form onSubmit={handleSecuritySubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Sécurité</CardTitle>
                  <CardDescription>
                    Modifiez votre mot de passe
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={securityData.currentPassword}
                      onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={securityData.newPassword}
                      onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Le mot de passe doit contenir au moins 8 caractères.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={securityData.confirmPassword}
                      onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-4">
                    <h3 className="font-medium flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
                      Protection du compte
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Options de sécurité supplémentaires pour protéger votre compte.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                          <p className="text-sm text-muted-foreground">
                            Ajoute une couche de sécurité supplémentaire à votre compte.
                          </p>
                        </div>
                        <Switch id="two-factor" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label htmlFor="session-timeout">Déconnexion automatique</Label>
                          <p className="text-sm text-muted-foreground">
                            Se déconnecter automatiquement après une période d'inactivité.
                          </p>
                        </div>
                        <Switch id="session-timeout" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="ml-auto bg-perenco-accent hover:bg-perenco-accent/90"
                    disabled={saving || 
                      !securityData.currentPassword || 
                      !securityData.newPassword || 
                      !securityData.confirmPassword
                    }
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Mettre à jour
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>
                  Configurez comment vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-medium flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                      Notifications par e-mail
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications par e-mail concernant vos réservations.
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-reservation">Nouvelles réservations</Label>
                      <Switch 
                        id="email-reservation" 
                        checked={accountData.notifyEmail}
                        onCheckedChange={(checked) => handleAccountChange('notifyEmail', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-payment">Confirmations de paiement</Label>
                      <Switch 
                        id="email-payment" 
                        checked={accountData.notifyEmail}
                        onCheckedChange={(checked) => handleAccountChange('notifyEmail', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-sponsorship">Statut des parrainages</Label>
                      <Switch 
                        id="email-sponsorship" 
                        checked={accountData.notifyEmail}
                        onCheckedChange={(checked) => handleAccountChange('notifyEmail', checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-medium flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-muted-foreground" />
                      Notifications SMS
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Recevez des notifications SMS concernant vos réservations.
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-reservation">Nouvelles réservations</Label>
                      <Switch 
                        id="sms-reservation"
                        checked={accountData.notifySMS}
                        onCheckedChange={(checked) => handleAccountChange('notifySMS', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-payment">Confirmations de paiement</Label>
                      <Switch 
                        id="sms-payment"
                        checked={accountData.notifySMS}
                        onCheckedChange={(checked) => handleAccountChange('notifySMS', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-sponsorship">Statut des parrainages</Label>
                      <Switch 
                        id="sms-sponsorship"
                        checked={accountData.notifySMS}
                        onCheckedChange={(checked) => handleAccountChange('notifySMS', checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-medium flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-muted-foreground" />
                      Autres préférences
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Préférences générales de l'application
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dark-mode">Mode sombre</Label>
                      <Switch 
                        id="dark-mode"
                        checked={accountData.darkMode}
                        onCheckedChange={(checked) => handleAccountChange('darkMode', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="language">Langue</Label>
                      <div className="text-sm text-muted-foreground">Français</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="button" 
                  className="ml-auto bg-perenco-accent hover:bg-perenco-accent/90"
                  onClick={handleAccountSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Parametres;
