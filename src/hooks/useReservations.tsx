
import { useState, useEffect } from 'react';
import { Reservation, ReservationStatus, User, Equipment } from '@/types';

// Sample data for demonstration
const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    utilisateur_id: '3',
    date_reservation: '2025-05-10',
    heure_debut: '12:00',
    heure_fin: '18:00',
    statut: 'confirmée' as ReservationStatus,
    type_utilisateur: 'PERENCO',
    devis_id: '1',
    confirmation_video_effectuee: true
  },
  {
    id: '2',
    utilisateur_id: '2',
    date_reservation: '2025-05-15',
    heure_debut: '09:00',
    heure_fin: '17:00',
    statut: 'en attente' as ReservationStatus,
    type_utilisateur: 'PERENCO',
    devis_id: '2',
    confirmation_video_effectuee: false
  },
  {
    id: '3',
    utilisateur_id: '3',
    date_reservation: '2025-06-01',
    heure_debut: '10:00',
    heure_fin: '16:00',
    statut: 'liste d\'attente' as ReservationStatus,
    type_utilisateur: 'PERENCO',
    confirmation_video_effectuee: false
  }
];

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
  createReservation: (newReservation: Partial<Reservation>, selectedEquipments: { id: string; quantity: number }[]) => Promise<Reservation>;
  updateReservationStatus: (id: string, newStatus: ReservationStatus) => Promise<boolean>;
  getAvailableSlots: (date: Date) => { start: string; end: string }[];
  getEquipments: () => Equipment[];
}

export const useReservations = (user: User | null): ReservationsHook => {
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [loading, setLoading] = useState<boolean>(false);

  // Filter reservations for the current user
  const userReservations = reservations.filter(
    reservation => reservation.utilisateur_id === user?.id
  );

  const createReservation = async (
    newReservation: Partial<Reservation>,
    selectedEquipments: { id: string; quantity: number }[]
  ): Promise<Reservation> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a new ID
    const id = (reservations.length + 1).toString();
    
    // Create the reservation
    const reservation: Reservation = {
      id,
      utilisateur_id: user?.id || '',
      date_reservation: newReservation.date_reservation || new Date().toISOString().split('T')[0],
      heure_debut: newReservation.heure_debut || '12:00',
      heure_fin: newReservation.heure_fin || '18:00',
      statut: checkAvailability(newReservation) ? 'confirmée' : 'liste d\'attente',
      type_utilisateur: user?.statut || 'PERENCO',
      confirmation_video_effectuee: false,
    };
    
    // Update reservations state
    setReservations([...reservations, reservation]);
    
    setLoading(false);
    return reservation;
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
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the reservation status
    setReservations(prevReservations => 
      prevReservations.map(res => 
        res.id === id ? { ...res, statut: newStatus } : res
      )
    );
    
    setLoading(false);
    return true;
  };

  const getAvailableSlots = (date: Date): { start: string; end: string }[] => {
    // Default time slots
    const defaultSlots = [
      { start: '08:00', end: '12:00' },
      { start: '12:00', end: '18:00' },
      { start: '18:00', end: '22:00' },
    ];
    
    // Get the date string format
    const dateString = date.toISOString().split('T')[0];
    
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
    return MOCK_EQUIPMENTS;
  };

  return {
    reservations,
    userReservations,
    loading,
    createReservation,
    updateReservationStatus,
    getAvailableSlots,
    getEquipments,
  };
};
