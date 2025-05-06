
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Reservation, ReservationStatus, User, Equipment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

// Sample equipment data for demonstration
const MOCK_EQUIPMENTS: Equipment[] = [
  {
    id: '1',
    nom: 'Chaise',
    quantite_totale: 50,
    description: 'Chaise confortable pour les invités'
  },
  {
    id: '2',
    nom: 'Table',
    quantite_totale: 15,
    description: 'Table rectangulaire pouvant accueillir 6 personnes'
  },
  {
    id: '3',
    nom: 'Projecteur',
    quantite_totale: 3,
    description: 'Projecteur HD avec câble HDMI'
  },
  {
    id: '4',
    nom: 'Système audio',
    quantite_totale: 2,
    description: 'Système audio complet avec microphones'
  }
];

interface ReservationsHook {
  reservations: Reservation[];
  userReservations: Reservation[];
  loading: boolean;
  fetchReservations: () => Promise<void>;
  createReservation: (newReservation: Partial<Reservation>, selectedEquipments: { id: string; quantity: number }[]) => Promise<Reservation | undefined>;
  updateReservationStatus: (id: string, newStatus: ReservationStatus) => Promise<boolean>;
  getAvailableSlots: (date: Date) => { start: string; end: string }[];
  getEquipments: () => Equipment[];
}

export const useReservations = (user: User | null): ReservationsHook => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter reservations for the current user
  const userReservations = reservations.filter(
    reservation => reservation.utilisateur_id === user?.id
  );

  // Fetch all reservations from Supabase
  const fetchReservations = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*');
      
      if (error) {
        console.error('Error fetching reservations:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les réservations',
          variant: 'destructive',
        });
        return;
      }
      
      // Transform Supabase reservation data to our app's reservation format
      const formattedReservations: Reservation[] = data.map(item => ({
        id: item.id,
        utilisateur_id: item.user_id,
        date_reservation: format(new Date(item.start_time), 'yyyy-MM-dd'),
        heure_debut: format(new Date(item.start_time), 'HH:mm'),
        heure_fin: format(new Date(item.end_time), 'HH:mm'),
        statut: mapStatusFromSupabase(item.status),
        type_utilisateur: 'PERENCO', // Default value as this may not be in Supabase schema
        devis_id: item.id, // Using reservation id as devis_id for now
        confirmation_video_effectuee: false, // Default value
      }));
      
      setReservations(formattedReservations);
    } catch (error) {
      console.error('Error in fetchReservations:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du chargement des réservations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Map Supabase status values to our app's status values
  const mapStatusFromSupabase = (status: string): ReservationStatus => {
    switch (status) {
      case 'pending': return 'en attente';
      case 'confirmed': return 'confirmée';
      case 'waitlist': return 'liste d\'attente';
      case 'cancelled': return 'annulée';
      default: return 'en attente';
    }
  };

  // Map our app's status values to Supabase status values
  const mapStatusToSupabase = (status: ReservationStatus): string => {
    switch (status) {
      case 'en attente': return 'pending';
      case 'confirmée': return 'confirmed';
      case 'liste d\'attente': return 'waitlist';
      case 'annulée': return 'cancelled';
      default: return 'pending';
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const createReservation = async (
    newReservation: Partial<Reservation>,
    selectedEquipments: { id: string; quantity: number }[]
  ): Promise<Reservation | undefined> => {
    setLoading(true);
    
    try {
      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté pour créer une réservation',
          variant: 'destructive',
        });
        return undefined;
      }
      
      const startDate = `${newReservation.date_reservation}T${newReservation.heure_debut}`;
      const endDate = `${newReservation.date_reservation}T${newReservation.heure_fin}`;
      
      // Check availability first
      const isAvailable = checkAvailability(newReservation);
      const status = isAvailable ? 'confirmed' : 'waitlist';
      
      // Create reservation in Supabase
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          user_id: user.id,
          title: `Réservation par ${user.prenom} ${user.nom}`,
          start_time: startDate,
          end_time: endDate,
          status: status,
          room_id: 'default', // You might want to make this dynamic in the future
          description: `Équipements: ${selectedEquipments.map(e => `${e.id} (${e.quantity})`).join(', ')}`,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating reservation:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de créer la réservation: ' + error.message,
          variant: 'destructive',
        });
        return undefined;
      }
      
      // Create the reservation object
      const reservation: Reservation = {
        id: data.id,
        utilisateur_id: user.id,
        date_reservation: newReservation.date_reservation || format(new Date(), 'yyyy-MM-dd'),
        heure_debut: newReservation.heure_debut || '12:00',
        heure_fin: newReservation.heure_fin || '18:00',
        statut: isAvailable ? 'confirmée' : 'liste d\'attente',
        type_utilisateur: user.statut,
        devis_id: data.id, // Using reservation id as devis_id for now
        confirmation_video_effectuee: false,
      };
      
      // Update local state
      setReservations([...reservations, reservation]);
      
      toast({
        title: 'Réservation créée',
        description: isAvailable 
          ? 'Votre réservation a été confirmée' 
          : 'Votre demande a été placée en liste d\'attente',
      });
      
      return reservation;
    } catch (error) {
      console.error('Error in createReservation:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de la réservation',
        variant: 'destructive',
      });
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = (newReservation: Partial<Reservation>): boolean => {
    // Check if there are any conflicts with existing reservations
    const conflicts = reservations.filter(res => {
      // Same date
      if (res.date_reservation !== newReservation.date_reservation) return false;
      
      // Time overlap check
      const newStart = newReservation.heure_debut || '00:00';
      const newEnd = newReservation.heure_fin || '23:59';
      
      const existingStart = res.heure_debut;
      const existingEnd = res.heure_fin;
      
      // Check for overlap
      if (newStart >= existingEnd || newEnd <= existingStart) {
        return false;
      }
      
      return true;
    });
    
    // If there are no conflicts, it's available
    return conflicts.length === 0;
  };

  const updateReservationStatus = async (id: string, newStatus: ReservationStatus): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Update reservation status in Supabase
      const { error } = await supabase
        .from('reservations')
        .update({
          status: mapStatusToSupabase(newStatus),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating reservation status:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour le statut de la réservation: ' + error.message,
          variant: 'destructive',
        });
        return false;
      }
      
      // Update local state
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === id ? { ...res, statut: newStatus } : res
        )
      );
      
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de la réservation a été mis à jour avec succès',
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateReservationStatus:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSlots = (date: Date): { start: string; end: string }[] => {
    // Default time slots
    const defaultSlots = [
      { start: '08:00', end: '12:00' },
      { start: '12:00', end: '18:00' },
      { start: '18:00', end: '22:00' },
    ];
    
    // Get the date string format
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Filter out slots that are already booked
    const bookedSlots = reservations.filter(res => 
      res.date_reservation === dateString && 
      (res.statut === 'confirmée' || res.statut === 'en attente')
    );
    
    // Return available slots
    return defaultSlots.filter(slot => {
      return !bookedSlots.some(booking => {
        // Check if the booking overlaps with this slot
        return (booking.heure_debut < slot.end && booking.heure_fin > slot.start);
      });
    });
  };

  const getEquipments = (): Equipment[] => {
    // In the future, fetch this from Supabase
    return MOCK_EQUIPMENTS;
  };

  return {
    reservations,
    userReservations,
    loading,
    fetchReservations,
    createReservation,
    updateReservationStatus,
    getAvailableSlots,
    getEquipments,
  };
};
