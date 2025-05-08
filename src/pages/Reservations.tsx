
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useReservations, ReservationWithDetails } from '@/hooks/useReservations';
import { usePayments } from '@/hooks/usePayments';
import { Equipment } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { format, addDays, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarRange, Clock, CreditCard, FileText, Info, Loader2, RefreshCw, Video, X } from 'lucide-react';

const Reservations: React.FC = () => {
  const { user } = useAuth();
  const { 
    loading, 
    reservations,
    myReservations,
    fetchReservations,
    createReservation, 
    updateReservationStatus, 
    getAvailableSlots, 
    getEquipments 
  } = useReservations();
  
  const { generateDevis } = usePayments();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<{start: string, end: string, isAvailable: boolean}[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{start: string, end: string} | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<{id: string, quantity: number}[]>([]);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Set equipment when component mounts
  useEffect(() => {
    if (getEquipments) {
      setEquipments(getEquipments());
    }
  }, [getEquipments]);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isAdminOrManager = isAdmin || isManager;

  const reservationStatusColors = {
    'en attente': 'bg-yellow-100 text-yellow-800',
    'confirmée': 'bg-green-100 text-green-800',
    'liste d\'attente': 'bg-blue-100 text-blue-800',
    'annulée': 'bg-red-100 text-red-800',
    'confirmed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'waitlist': 'bg-blue-100 text-blue-800',
  };

  // Update available slots when date changes
  React.useEffect(() => {
    if (selectedDate && getAvailableSlots) {
      const slots = getAvailableSlots(selectedDate);
      setAvailableSlots(slots);
      setSelectedSlot(null);
    }
  }, [selectedDate, reservations, getAvailableSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSlotSelect = (slot: {start: string, end: string}) => {
    setSelectedSlot(slot);
  };

  const handleEquipmentChange = (equipmentId: string, quantity: number) => {
    setSelectedEquipments(prev => {
      const existingIndex = prev.findIndex(eq => eq.id === equipmentId);
      
      if (existingIndex >= 0) {
        // Update existing equipment quantity or remove if quantity is 0
        if (quantity === 0) {
          return prev.filter(eq => eq.id !== equipmentId);
        }
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else if (quantity > 0) {
        // Add new equipment
        return [...prev, { id: equipmentId, quantity }];
      }
      return prev;
    });
  };

  // Handle reservation submission
  const handleReservationSubmit = async () => {
    if (!selectedDate || !selectedSlot) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date et un créneau horaire",
        variant: "destructive"
      });
      return;
    }
    
    setCreateLoading(true);
    
    try {
      // Format date
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      console.log("Submitting reservation:", {
        date: dateString,
        timeSlot: selectedSlot,
        equipments: selectedEquipments
      });
      
      // Create reservation with the updated interface
      const success = await createReservation({
        title: `Réservation du ${format(selectedDate, 'dd/MM/yyyy')}`,
        description: "Réservation créée via le formulaire",
        room_id: "room-1", // Default room ID
        date: selectedDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        selectedEquipment: selectedEquipments.map(e => ({
          id: e.id,
          name: equipments.find(eq => eq.id === e.id)?.nom || '',
          quantity: e.quantity
        }))
      });
      
      // Check if reservation was created
      if (success) {
        // Reset form
        setSelectedSlot(null);
        setSelectedEquipments([]);
        
        // Close dialog
        setReservationDialogOpen(false);
        
        // Refresh reservations list
        await fetchReservations();
        
        toast({
          title: "Succès",
          description: "Votre réservation a été créée avec succès",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer la réservation",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la réservation",
        variant: "destructive"
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const getReservationDateTime = (reservation: ReservationWithDetails) => {
    const date = new Date(reservation.start_time);
    return {
      date: format(date, 'dd MMMM yyyy', { locale: fr }),
      time: `${reservation.start_time.split('T')[1].substring(0, 5)} - ${reservation.end_time.split('T')[1].substring(0, 5)}`,
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (updateReservationStatus) {
      await updateReservationStatus(id, newStatus);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Réservations</h1>
            <p className="text-muted-foreground">Gérez vos réservations du Foyer Bassa</p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Dialog open={reservationDialogOpen} onOpenChange={setReservationDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-perenco-accent hover:bg-perenco-accent/90">
                  Nouvelle réservation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouvelle réservation</DialogTitle>
                  <DialogDescription>
                    Réservez une salle au Foyer Bassa pour votre événement.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Date de réservation</Label>
                    <div className="border rounded-md p-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date()}
                        className="mx-auto pointer-events-auto"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Créneaux disponibles</Label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {availableSlots.map((slot, index) => (
                          <Button
                            key={index}
                            variant={selectedSlot && selectedSlot.start === slot.start && selectedSlot.end === slot.end ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => handleSlotSelect(slot)}
                            disabled={!slot.isAvailable}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            <span>{slot.start} - {slot.end}</span>
                            {!slot.isAvailable && <span className="ml-auto text-red-500">Indisponible</span>}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 border rounded-md bg-yellow-50 text-yellow-800">
                        <Info className="h-5 w-5 mx-auto mb-2" />
                        <p>Aucun créneau disponible à cette date.</p>
                        <p className="text-sm">Veuillez sélectionner une autre date.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Équipements (optionnel)</Label>
                    <div className="border rounded-md p-4 space-y-4 max-h-[200px] overflow-y-auto">
                      {equipments.map((equipment) => (
                        <div key={equipment.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{equipment.nom}</p>
                            <p className="text-sm text-muted-foreground">{equipment.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const current = selectedEquipments.find(eq => eq.id === equipment.id)?.quantity || 0;
                                if (current > 0) {
                                  handleEquipmentChange(equipment.id, current - 1);
                                }
                              }}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">
                              {selectedEquipments.find(eq => eq.id === equipment.id)?.quantity || 0}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                const current = selectedEquipments.find(eq => eq.id === equipment.id)?.quantity || 0;
                                if (current < equipment.quantite_totale) {
                                  handleEquipmentChange(equipment.id, current + 1);
                                }
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReservationDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleReservationSubmit}
                    disabled={!selectedDate || !selectedSlot || createLoading}
                  >
                    {createLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Réservation en cours...
                      </>
                    ) : (
                      'Réserver'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="my-reservations">
          <TabsList>
            <TabsTrigger value="my-reservations">Mes réservations</TabsTrigger>
            {isAdminOrManager && (
              <TabsTrigger value="all-reservations">Toutes les réservations</TabsTrigger>
            )}
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-reservations">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-perenco-accent" />
                </div>
              ) : myReservations && myReservations.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">Aucune réservation</h3>
                  <p className="text-muted-foreground mt-1">
                    Vous n'avez pas encore effectué de réservation.
                  </p>
                  <Button
                    className="mt-4 bg-perenco-accent hover:bg-perenco-accent/90"
                    onClick={() => setReservationDialogOpen(true)}
                  >
                    Réserver maintenant
                  </Button>
                </div>
              ) : (
                myReservations && myReservations.map(reservation => {
                  const dateTime = getReservationDateTime(reservation);
                  // Use null coalescing for potentially undefined properties
                  const videoConfirmation = reservation.confirmation_video_effectuee || false;
                  return (
                    <Card key={reservation.id} className="card-hover-effect">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Réservation #{reservation.id.substring(0, 8)}</span>
                          <Badge className={reservationStatusColors[reservation.status] || reservationStatusColors[reservation.statut || '']}>
                            {reservation.statut || reservation.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{dateTime.date}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{dateTime.time}</span>
                        </div>
                        <div className="flex items-center">
                          <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{videoConfirmation ? 'Entretien effectué' : 'Entretien à prévoir'}</span>
                        </div>
                        {reservation.devis_id && (
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Devis disponible</span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (reservation.status === 'confirmed' || reservation.status === 'confirmée' ||
                                reservation.statut === 'confirmed' || reservation.statut === 'confirmée') {
                              handleStatusChange(reservation.id, 'cancelled');
                            }
                          }}
                          disabled={reservation.status !== 'confirmed' && 
                                   reservation.status !== 'confirmée' && 
                                   reservation.statut !== 'confirmed' && 
                                   reservation.statut !== 'confirmée'}
                        >
                          {(reservation.status === 'confirmed' || reservation.status === 'confirmée' ||
                            reservation.statut === 'confirmed' || reservation.statut === 'confirmée') ? 'Annuler' : 'Voir détails'}
                        </Button>
                        {reservation.devis_id && (
                          <Button size="sm">
                            <FileText className="h-4 w-4 mr-2" /> Devis
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
          
          {isAdminOrManager && (
            <TabsContent value="all-reservations">
              <Card>
                <CardHeader>
                  <CardTitle>Toutes les réservations</CardTitle>
                  <CardDescription>Liste de toutes les réservations du Foyer Bassa</CardDescription>
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
                          <TableHead>Date</TableHead>
                          <TableHead>Horaire</TableHead>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reservations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Aucune réservation trouvée
                            </TableCell>
                          </TableRow>
                        ) : (
                          reservations.map(reservation => {
                            const dateTime = getReservationDateTime(reservation);
                            return (
                              <TableRow key={reservation.id}>
                                <TableCell>{reservation.id.substring(0, 8)}</TableCell>
                                <TableCell>{dateTime.date}</TableCell>
                                <TableCell>{dateTime.time}</TableCell>
                                <TableCell>{reservation.utilisateur_id || reservation.user_id}</TableCell>
                                <TableCell>
                                  <Badge className={reservationStatusColors[reservation.status] || reservationStatusColors[reservation.statut || '']}>
                                    {reservation.statut || reservation.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      Détails
                                    </Button>
                                    {(reservation.status !== 'confirmed' && 
                                      reservation.status !== 'confirmée' && 
                                      reservation.statut !== 'confirmed' && 
                                      reservation.statut !== 'confirmée') ? (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                                      >
                                        Confirmer
                                      </Button>
                                    ) : (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                                      >
                                        Annuler
                                      </Button>
                                    )}
                                  </div>
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
          )}
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendrier des réservations</CardTitle>
                <CardDescription>Vue d'ensemble des réservations planifiées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      className="mx-auto pointer-events-auto"
                    />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    </h3>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      {loading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-perenco-accent" />
                        </div>
                      ) : availableSlots.length > 0 ? (
                        availableSlots.map((slot, index) => {
                          if (slot.isAvailable) {
                            return (
                              <div key={index} className="flex items-center p-2 border rounded-md bg-green-50">
                                <div className="h-3 w-3 rounded-full bg-green-500 mr-3" />
                                <span className="font-medium">{slot.start} - {slot.end}</span>
                                <Badge className="ml-auto" variant="outline">
                                  Disponible
                                </Badge>
                              </div>
                            );
                          } else {
                            return (
                              <div key={index} className="flex items-center p-2 border rounded-md bg-red-50">
                                <div className="h-3 w-3 rounded-full bg-red-500 mr-3" />
                                <span className="font-medium">{slot.start} - {slot.end}</span>
                                <Badge className="ml-auto" variant="outline">
                                  Réservé
                                </Badge>
                              </div>
                            );
                          }
                        })
                      ) : (
                        <div className="text-center p-4 border rounded-md bg-yellow-50">
                          <p>Aucun créneau disponible à cette date.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reservations;
