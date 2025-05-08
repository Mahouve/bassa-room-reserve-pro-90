import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { usePayments } from '@/hooks/usePayments';
import { useReservations } from '@/hooks/useReservations';
import { useAuth } from '@/hooks/useAuth';
import { PaymentMethod } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CreditCard, 
  Upload, 
  Download, 
  Plus, 
  Search, 
  Receipt, 
  File, 
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Paiements: React.FC = () => {
  const { user } = useAuth();
  const { payments, devis, loading, createPayment, uploadJustificatif } = usePayments();
  const { reservations } = useReservations();
  const [paymentFormData, setPaymentFormData] = useState({
    reservation_id: '',
    montant: 0,
    date_paiement: format(new Date(), 'yyyy-MM-dd'),
    mode_paiement: 'virement' as PaymentMethod,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isAdminOrManager = isAdmin || isManager;

  // If not admin or manager, redirect to dashboard
  if (!isAdminOrManager) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <CreditCard className="h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès non autorisé</h1>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-perenco-accent hover:bg-perenco-accent/90"
          >
            Retour au tableau de bord
          </Button>
        </div>
      </Layout>
    );
  }

  const paymentMethods = [
    { value: 'carte', label: 'Carte bancaire' },
    { value: 'espèces', label: 'Espèces' },
    { value: 'virement', label: 'Virement bancaire' },
    { value: 'chèque', label: 'Chèque' },
  ];

  const handlePaymentFormChange = (key: string, value: string | number) => {
    setPaymentFormData(prev => ({ ...prev, [key]: value }));
    
    // If reservation_id changes, update montant based on devis
    if (key === 'reservation_id') {
      const reservationDevis = devis.find(d => d.reservation_id === value);
      if (reservationDevis) {
        setPaymentFormData(prev => ({ ...prev, montant: reservationDevis.montant_total }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePaymentSubmit = async () => {
    setActionLoading(true);
    
    try {
      const newPayment = await createPayment(paymentFormData);
      
      toast({
        title: 'Paiement enregistré',
        description: `Le paiement de ${paymentFormData.montant.toLocaleString()} XAF a été enregistré avec succès.`,
      });
      
      // Reset form and close dialog
      setPaymentFormData({
        reservation_id: '',
        montant: 0,
        date_paiement: format(new Date(), 'yyyy-MM-dd'),
        mode_paiement: 'virement',
      });
      setPaymentDialogOpen(false);
      
      // If there's a file, open the upload dialog
      if (selectedFile) {
        setSelectedPaymentId(newPayment.id);
        setUploadDialogOpen(true);
      }
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

  const handleUploadSubmit = async () => {
    if (!selectedFile || !selectedPaymentId) return;
    
    setActionLoading(true);
    
    try {
      await uploadJustificatif(selectedPaymentId, selectedFile);
      
      toast({
        title: 'Justificatif téléversé',
        description: `Le justificatif a été téléversé avec succès.`,
      });
      
      // Reset form and close dialog
      setSelectedFile(null);
      setSelectedPaymentId(null);
      setUploadDialogOpen(false);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Paiements</h1>
            <p className="text-muted-foreground">Gérez les paiements des réservations</p>
          </div>
          
          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-perenco-accent hover:bg-perenco-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau paiement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enregistrer un paiement</DialogTitle>
                <DialogDescription>
                  Entrez les détails du paiement pour une réservation.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reservation_id">Réservation</Label>
                  <Select 
                    value={paymentFormData.reservation_id} 
                    onValueChange={(value) => handlePaymentFormChange('reservation_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une réservation" />
                    </SelectTrigger>
                    <SelectContent>
                      {reservations.map(reservation => (
                        <SelectItem key={reservation.id} value={reservation.id}>
                          Réservation #{reservation.id} - {reservation.start_time.split('T')[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="montant">Montant (XAF)</Label>
                  <Input 
                    id="montant" 
                    type="number" 
                    value={paymentFormData.montant}
                    onChange={(e) => handlePaymentFormChange('montant', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date_paiement">Date de paiement</Label>
                  <Input 
                    id="date_paiement" 
                    type="date" 
                    value={paymentFormData.date_paiement}
                    onChange={(e) => handlePaymentFormChange('date_paiement', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mode_paiement">Mode de paiement</Label>
                  <Select 
                    value={paymentFormData.mode_paiement} 
                    onValueChange={(value) => handlePaymentFormChange('mode_paiement', value as PaymentMethod)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un mode de paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="justificatif">Justificatif de paiement (optionnel)</Label>
                  <Input 
                    id="justificatif" 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*, application/pdf"
                  />
                  <p className="text-sm text-muted-foreground">
                    Formats acceptés : JPEG, PNG, PDF
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handlePaymentSubmit} 
                  disabled={actionLoading || !paymentFormData.reservation_id}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer le paiement'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Téléverser un justificatif</DialogTitle>
                <DialogDescription>
                  Ajoutez un justificatif pour le paiement.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="justificatif_upload">Justificatif de paiement</Label>
                  <Input 
                    id="justificatif_upload" 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*, application/pdf"
                  />
                  <p className="text-sm text-muted-foreground">
                    Formats acceptés : JPEG, PNG, PDF
                  </p>
                </div>
                
                {selectedFile && (
                  <div className="p-4 border rounded-lg bg-blue-50 flex items-center">
                    <File className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} Ko
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleUploadSubmit} 
                  disabled={actionLoading || !selectedFile}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Téléversement...
                    </>
                  ) : (
                    'Téléverser'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="paiements">
          <TabsList>
            <TabsTrigger value="paiements">Paiements</TabsTrigger>
            <TabsTrigger value="devis">Devis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="paiements">
            <Card>
              <CardHeader>
                <CardTitle>Liste des paiements</CardTitle>
                <CardDescription>
                  Tous les paiements enregistrés pour les réservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-perenco-accent" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">Aucun paiement</h3>
                    <p className="text-muted-foreground mt-1 mb-4">
                      Aucun paiement n'a encore été enregistré.
                    </p>
                    <Button 
                      onClick={() => setPaymentDialogOpen(true)}
                      className="bg-perenco-accent hover:bg-perenco-accent/90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Enregistrer un paiement
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Réservation</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Date de paiement</TableHead>
                        <TableHead>Mode de paiement</TableHead>
                        <TableHead>Justificatif</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.id}</TableCell>
                          <TableCell>#{payment.reservation_id}</TableCell>
                          <TableCell className="font-medium">
                            {payment.montant.toLocaleString()} XAF
                          </TableCell>
                          <TableCell>
                            {format(new Date(payment.date_paiement), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.mode_paiement}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.justificatif_url ? (
                              <Button variant="ghost" size="sm" className="text-blue-600">
                                <Download className="h-4 w-4 mr-1" />
                                Télécharger
                              </Button>
                            ) : (
                              <span className="text-red-500 text-sm">Non fourni</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!payment.justificatif_url && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPaymentId(payment.id);
                                  setUploadDialogOpen(true);
                                }}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Ajouter
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="devis">
            <Card>
              <CardHeader>
                <CardTitle>Liste des devis</CardTitle>
                <CardDescription>
                  Devis générés pour les réservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-perenco-accent" />
                  </div>
                ) : devis.length === 0 ? (
                  <div className="text-center py-8">
                    <File className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">Aucun devis</h3>
                    <p className="text-muted-foreground mt-1">
                      Aucun devis n'a encore été généré.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Réservation</TableHead>
                        <TableHead>Montant total</TableHead>
                        <TableHead>Date de génération</TableHead>
                        <TableHead>Statut de paiement</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devis.map((devis) => {
                        const isPaid = payments.some(p => p.reservation_id === devis.reservation_id);
                        return (
                          <TableRow key={devis.id}>
                            <TableCell>{devis.id}</TableCell>
                            <TableCell>#{devis.reservation_id}</TableCell>
                            <TableCell className="font-medium">
                              {devis.montant_total.toLocaleString()} XAF
                            </TableCell>
                            <TableCell>
                              {format(new Date(devis.date_generation), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                              {isPaid ? (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Payé
                                </div>
                              ) : (
                                <div className="flex items-center text-red-600">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Non payé
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Télécharger
                              </Button>
                              {!isPaid && (
                                <Button
                                  variant="outline" 
                                  size="sm"
                                  className="ml-2"
                                  onClick={() => {
                                    setPaymentFormData({
                                      reservation_id: devis.reservation_id,
                                      montant: devis.montant_total,
                                      date_paiement: format(new Date(), 'yyyy-MM-dd'),
                                      mode_paiement: 'virement',
                                    });
                                    setPaymentDialogOpen(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Paiement
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Paiements;
