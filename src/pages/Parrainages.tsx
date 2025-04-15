
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { Sponsorship } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Parrainages: React.FC = () => {
  const { user } = useAuth();
  const { sponsorships, loading, createSponsorship, updateSponsorshipStatus } = useUsers();
  const [sponsorFormData, setSponsorFormData] = useState({
    nom_parraine: '',
    contact_parraine: '',
  });
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isAdminOrManager = isAdmin || isManager;

  // Filter sponsorships for the current user
  const userSponsorships = user ? sponsorships.filter(
    s => s.utilisateur_id === user.id
  ) : [];

  const handleSponsorshipSubmit = async () => {
    if (!user) return;
    
    setActionLoading(true);
    
    try {
      // Create sponsorship
      await createSponsorship({
        utilisateur_id: user.id,
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

  const getSponsorshipCard = (sponsorship: Sponsorship) => {
    const statusColor = {
      'en attente': 'bg-yellow-100 text-yellow-800',
      'validé': 'bg-green-100 text-green-800',
      'refusé': 'bg-red-100 text-red-800',
    }[sponsorship.statut_validation];
    
    return (
      <Card key={sponsorship.id} className="card-hover-effect">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{sponsorship.nom_parraine}</CardTitle>
            <Badge className={statusColor}>
              {sponsorship.statut_validation}
            </Badge>
          </div>
          <CardDescription>
            Contact: {sponsorship.contact_parraine}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {sponsorship.statut_validation === 'en attente' && 'En attente de validation par un administrateur.'}
            {sponsorship.statut_validation === 'validé' && 'Ce parrainage a été approuvé.'}
            {sponsorship.statut_validation === 'refusé' && 'Ce parrainage a été refusé.'}
          </p>
        </CardContent>
        {isAdminOrManager && sponsorship.statut_validation === 'en attente' && (
          <CardFooter className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              onClick={() => handleUpdateSponsorshipStatus(sponsorship.id, 'validé', sponsorship.nom_parraine)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Valider
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              onClick={() => handleUpdateSponsorshipStatus(sponsorship.id, 'refusé', sponsorship.nom_parraine)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Refuser
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Parrainages</h1>
            <p className="text-muted-foreground">Gérez vos parrainages pour le Foyer Bassa</p>
          </div>
          
          {user?.statut === 'PERENCO' && (
            <Dialog open={sponsorDialogOpen} onOpenChange={setSponsorDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-perenco-accent hover:bg-perenco-accent/90">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nouveau parrainage
                </Button>
              </DialogTrigger>
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
          )}
        </div>

        {/* Admin/Manager view: all sponsorships */}
        {isAdminOrManager ? (
          <Card>
            <CardHeader>
              <CardTitle>Toutes les demandes de parrainage</CardTitle>
              <CardDescription>
                Validez ou refusez les demandes de parrainage
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
        ) : (
          // Regular user view: just their own sponsorships
          <div>
            <h2 className="text-xl font-semibold mb-4">Mes parrainages</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-perenco-accent" />
              </div>
            ) : userSponsorships.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <UserPlus className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium">Aucun parrainage</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Vous n'avez pas encore parrainé de personne externe.
                </p>
                {user?.statut === 'PERENCO' && (
                  <Button 
                    onClick={() => setSponsorDialogOpen(true)}
                    className="bg-perenco-accent hover:bg-perenco-accent/90"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Parrainer quelqu'un
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userSponsorships.map(sponsorship => getSponsorshipCard(sponsorship))}
              </div>
            )}
            
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>À propos du parrainage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-md">
                    <h3 className="font-medium text-blue-800">Qui peut parrainer ?</h3>
                    <p className="mt-1 text-blue-700">
                      Seuls les membres du personnel PERENCO peuvent parrainer des personnes externes.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-md">
                    <h3 className="font-medium text-amber-800">Processus de validation</h3>
                    <p className="mt-1 text-amber-700">
                      Toutes les demandes de parrainage doivent être validées par un administrateur avant d'être effectives.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-md">
                    <h3 className="font-medium text-green-800">Tarification spécifique</h3>
                    <p className="mt-1 text-green-700">
                      Les personnes parrainées bénéficient d'un tarif spécifique pour la réservation du Foyer Bassa.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Parrainages;
