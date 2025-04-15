
export type Role = "admin" | "manager" | "utilisateur" | "invité";
export type UserStatus = "PERENCO" | "contractuel" | "parrainé";
export type ReservationStatus = "en attente" | "confirmée" | "liste d'attente" | "annulée";
export type PaymentMethod = "carte" | "espèces" | "virement" | "chèque";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  statut: UserStatus;
  date_creation: string;
}

export interface Reservation {
  id: string;
  utilisateur_id: string;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  statut: ReservationStatus;
  type_utilisateur: UserStatus;
  devis_id?: string;
  confirmation_video_effectuee: boolean;
}

export interface Payment {
  id: string;
  reservation_id: string;
  montant: number;
  date_paiement: string;
  mode_paiement: PaymentMethod;
  justificatif_url?: string;
}

export interface Devis {
  id: string;
  reservation_id: string;
  montant_total: number;
  details: {
    frais_location: number;
    frais_equipements?: number;
    frais_entretien?: number;
    autres_frais?: {
      description: string;
      montant: number;
    }[];
  };
  date_generation: string;
}

export interface Equipment {
  id: string;
  nom: string;
  quantite_totale: number;
  description: string;
}

export interface EquipmentReservation {
  id: string;
  reservation_id: string;
  equipement_id: string;
  quantite_utilisee: number;
}

export interface Sponsorship {
  id: string;
  utilisateur_id: string;
  nom_parraine: string;
  contact_parraine: string;
  statut_validation: "en attente" | "validé" | "refusé";
}

export interface VisioSuivi {
  id: string;
  reservation_id: string;
  lien_visio: string;
  date_visio: string;
  feedback_utilisateur?: string;
}

export interface DashboardStats {
  total_reservations: number;
  taux_occupation: number;
  revenus_totaux: number;
  stats_utilisateurs: {
    total: number;
    perenco: number;
    contractuels: number;
    parraines: number;
  };
}
