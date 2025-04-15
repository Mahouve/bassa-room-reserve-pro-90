
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useUsers } from '@/hooks/useUsers';
import { User, Role, UserStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Plus, 
  CheckCircle, 
  XCircle,
  UserPlus,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Utilisateurs: React.FC = () => {
  const { users, sponsorships, loading, createUser, updateUser, deleteUser, updateSponsorshipStatus, createSponsorship } = useUsers();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'utilisateur',
    statut: 'PERENCO',
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [sponsorFormData, setSponsorFormData] = useState({
    nom_parraine: '',
    contact_parraine: '',
  });
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState<boolean>(false);

  const roleLabels: Record<Role, string> = {
    admin: 'Administrateur',
    manager: 'Gestionnaire',
    utilisateur: 'Utilisateur',
    invité: 'Invité',
  };

  const statusLabels: Record<UserStatus, string> = {
    PERENCO: 'PERENCO',
    contractuel: 'Contractuel',
    parrainé: 'Parrainé',
  };

  const roleColors: Record<Role, string> = {
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    utilisateur: 'bg-green-100 text-green-800',
    invité: 'bg-gray-100 text-gray-800',
  };

  const statusColors: Record<UserStatus, string> = {
    PERENCO: 'bg-blue-100 text-blue-800',
    contractuel: 'bg-green-100 text-green-800',
    parrainé: 'bg-yellow-100 text-yellow-800',
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.nom.toLowerCase().includes(query) ||
      user.prenom.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      roleLabels[user.role].toLowerCase().includes(query) ||
      statusLabels[user.statut].toLowerCase().includes(query)
    );
  });

  const handleOpenUserDialog = (user?: User) => {
    if (user) {
      // Edit mode
      setIsEditMode(true);
      setEditUserId(user.id);
      setUserFormData({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        statut: user.statut,
      });
    } else {
      // Create mode
      setIsEditMode(false);
      setEditUserId(null);
      setUserFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        role: 'utilisateur',
        statut: 'PERENCO',
      });
    }
    setDialogOpen(true);
  };

  const handleUserFormChange = (key: keyof User, value: string) => {
    setUserFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleUserSubmit = async () => {
    setActionLoading(true);
    
    try {
      if (isEditMode && editUserId) {
        // Update user
        await updateUser(editUserId, userFormData);
        toast({
          title: 'Utilisateur modifié',
          description: `${userFormData.prenom} ${userFormData.nom} a été mis à jour avec succès.`,
        });
      } else {
        // Create user
        await createUser(userFormData);
        toast({
          title: 'Utilisateur créé',
          description: `${userFormData.prenom} ${userFormData.nom} a été créé avec succès.`,
        });
      }
      
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userName} ?`)) {
      try {
        await deleteUser(userId);
        toast({
          title: 'Utilisateur supprimé',
          description: `${userName} a été supprimé avec succès.`,
        });
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue. Veuillez réessayer.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSponsorshipSubmit = async () => {
    setActionLoading(true);
    
    try {
      // Create sponsorship
      await createSponsorship({
        utilisateur_id: '3', // Hardcoded for demo
        nom_parraine: sponsorFormData.nom_parraine,
        contact_parraine: sponsorFormData.contact_parraine,
      });
      
      toast({
        title: 'Parrainage créé',
        description: `${sponsorFormData.nom_parraine} a été parrainé avec succès.`,
      });
      
      setSponsorDialogOpen(false);
      setSponsorFormData({
        nom_parraine: '',
        contact_parraine: '',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSponsorshipStatus = async (id: string, status: 'validé' | 'refusé', name: string) => {
    try {
      await updateSponsorshipStatus(id, status);
      
      toast({
        title: `Parrainage ${status}`,
        description: `Le parrainage de ${name} a été ${status}.`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les utilisateurs et les parrainages</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => handleOpenUserDialog()}
              className="bg-perenco-accent hover:bg-perenco-accent/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
            
            <Button 
              onClick={() => setSponsorDialogOpen(true)}
              variant="outline"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau parrainage
            </Button>
          </div>
        </div>

        <Tabs defaultValue="utilisateurs">
          <TabsList>
            <TabsTrigger value="utilisateurs">Utilisateurs</TabsTrigger>
            <TabsTrigger value="parrainages">Parrainages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="utilisateurs">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle>Liste des utilisateurs</CardTitle>
                  <CardDescription>
                    {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-perenco-accent" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date création</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Aucun utilisateur trouvé.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.prenom} {user.nom}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.telephone}</TableCell>
                            <TableCell>
                              <Badge className={roleColors[user.role]}>
                                {roleLabels[user.role]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[user.statut]}>
                                {statusLabels[user.statut]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(user.date_creation), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenUserDialog(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id, `${user.prenom} ${user.nom}`)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="parrainages">
            <Card>
              <CardHeader>
                <CardTitle>Liste des parrainages</CardTitle>
                <CardDescription>
                  Gérez les demandes de parrainage des utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-perenco-accent" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nom parrainé</TableHead>
                        <TableHead>Contact parrainé</TableHead>
                        <TableHead>Parrain</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sponsorships.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Aucun parrainage trouvé.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sponsorships.map((sponsorship) => {
                          const statusColor = {
                            'en attente': 'bg-yellow-100 text-yellow-800',
                            'validé': 'bg-green-100 text-green-800',
                            'refusé': 'bg-red-100 text-red-800',
                          }[sponsorship.statut_validation];
                          
                          return (
                            <TableRow key={sponsorship.id}>
                              <TableCell>{sponsorship.id}</TableCell>
                              <TableCell className="font-medium">
                                {sponsorship.nom_parraine}
                              </TableCell>
                              <TableCell>{sponsorship.contact_parraine}</TableCell>
                              <TableCell>Utilisateur #{sponsorship.utilisateur_id}</TableCell>
                              <TableCell>
                                <Badge className={statusColor}>
                                  {sponsorship.statut_validation}
                                </Badge>
                              </TableCell>
                              <TableCell className="flex justify-end gap-2">
                                {sponsorship.statut_validation === 'en attente' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                      onClick={() => handleUpdateSponsorshipStatus(sponsorship.id, 'validé', sponsorship.nom_parraine)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Valider
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                      onClick={() => handleUpdateSponsorshipStatus(sponsorship.id, 'refusé', sponsorship.nom_parraine)}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Refuser
                                    </Button>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? 'Modifiez les informations de l\'utilisateur.'
                  : 'Ajoutez un nouvel utilisateur au système.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input 
                    id="nom" 
                    value={userFormData.nom}
                    onChange={(e) => handleUserFormChange('nom', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input 
                    id="prenom" 
                    value={userFormData.prenom}
                    onChange={(e) => handleUserFormChange('prenom', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={userFormData.email}
                  onChange={(e) => handleUserFormChange('email', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input 
                  id="telephone" 
                  value={userFormData.telephone}
                  onChange={(e) => handleUserFormChange('telephone', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select 
                    value={userFormData.role} 
                    onValueChange={(value) => handleUserFormChange('role', value as Role)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="manager">Gestionnaire</SelectItem>
                      <SelectItem value="utilisateur">Utilisateur</SelectItem>
                      <SelectItem value="invité">Invité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statut">Statut</Label>
                  <Select 
                    value={userFormData.statut} 
                    onValueChange={(value) => handleUserFormChange('statut', value as UserStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERENCO">PERENCO</SelectItem>
                      <SelectItem value="contractuel">Contractuel</SelectItem>
                      <SelectItem value="parrainé">Parrainé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {!isEditMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe (généré automatiquement)</Label>
                  <Input id="password" type="text" value="password123" disabled />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUserSubmit} disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  isEditMode ? 'Modifier' : 'Créer'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sponsorship Dialog */}
        <Dialog open={sponsorDialogOpen} onOpenChange={setSponsorDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau parrainage</DialogTitle>
              <DialogDescription>
                Parrainer une personne externe pour l'accès au Foyer Bassa.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nom_parraine">Nom de la personne parrainée</Label>
                <Input 
                  id="nom_parraine" 
                  value={sponsorFormData.nom_parraine}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, nom_parraine: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_parraine">Contact (email ou téléphone)</Label>
                <Input 
                  id="contact_parraine" 
                  value={sponsorFormData.contact_parraine}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, contact_parraine: e.target.value })}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSponsorDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSponsorshipSubmit} disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Parrainer'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Utilisateurs;
