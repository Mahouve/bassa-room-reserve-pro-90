
import { useState } from 'react';
import { Payment, Devis, PaymentMethod } from '@/types';

// Sample data for demonstration
const MOCK_PAYMENTS: Payment[] = [
  {
    id: '1',
    reservation_id: '1',
    montant: 50000,
    date_paiement: '2025-05-08',
    mode_paiement: 'virement',
    justificatif_url: '/uploads/justificatifs/payment1.pdf'
  },
  {
    id: '2',
    reservation_id: '2',
    montant: 75000,
    date_paiement: '2025-05-12',
    mode_paiement: 'carte',
    justificatif_url: '/uploads/justificatifs/payment2.pdf'
  }
];

const MOCK_DEVIS: Devis[] = [
  {
    id: '1',
    reservation_id: '1',
    montant_total: 50000,
    details: {
      frais_location: 30000,
      frais_equipements: 15000,
      frais_entretien: 5000
    },
    date_generation: '2025-05-05'
  },
  {
    id: '2',
    reservation_id: '2',
    montant_total: 75000,
    details: {
      frais_location: 50000,
      frais_equipements: 20000,
      frais_entretien: 5000
    },
    date_generation: '2025-05-10'
  }
];

interface PaymentsHook {
  payments: Payment[];
  devis: Devis[];
  loading: boolean;
  createPayment: (newPayment: Partial<Payment>) => Promise<Payment>;
  uploadJustificatif: (paymentId: string, file: File) => Promise<boolean>;
  generateDevis: (reservationId: string, equipments: { id: string; quantity: number }[]) => Promise<Devis>;
  getDevisByReservation: (reservationId: string) => Devis | undefined;
  getPaymentByReservation: (reservationId: string) => Payment | undefined;
}

export const usePayments = (): PaymentsHook => {
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [devis, setDevis] = useState<Devis[]>(MOCK_DEVIS);
  const [loading, setLoading] = useState<boolean>(false);

  const createPayment = async (newPayment: Partial<Payment>): Promise<Payment> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a new ID
    const id = (payments.length + 1).toString();
    
    // Create the payment
    const payment: Payment = {
      id,
      reservation_id: newPayment.reservation_id || '',
      montant: newPayment.montant || 0,
      date_paiement: newPayment.date_paiement || new Date().toISOString().split('T')[0],
      mode_paiement: newPayment.mode_paiement as PaymentMethod || 'virement',
      justificatif_url: newPayment.justificatif_url
    };
    
    // Update payments state
    setPayments([...payments, payment]);
    
    setLoading(false);
    return payment;
  };

  const uploadJustificatif = async (paymentId: string, file: File): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would upload the file to a server
    const fakeUploadUrl = `/uploads/justificatifs/${file.name}`;
    
    // Update the payment with the justificatif URL
    setPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === paymentId ? { ...payment, justificatif_url: fakeUploadUrl } : payment
      )
    );
    
    setLoading(false);
    return true;
  };

  const generateDevis = async (reservationId: string, equipments: { id: string; quantity: number }[]): Promise<Devis> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculate costs
    const fraisLocation = 30000; // Base fee
    let fraisEquipements = 0;
    
    // Calculate equipment costs (simplified)
    equipments.forEach(eq => {
      fraisEquipements += eq.quantity * 1000; // 1000 XAF per equipment
    });
    
    const fraisEntretien = 5000; // Fixed cleaning fee
    const montantTotal = fraisLocation + fraisEquipements + fraisEntretien;
    
    // Generate a new ID
    const id = (devis.length + 1).toString();
    
    // Create the devis
    const newDevis: Devis = {
      id,
      reservation_id: reservationId,
      montant_total: montantTotal,
      details: {
        frais_location: fraisLocation,
        frais_equipements: fraisEquipements,
        frais_entretien: fraisEntretien
      },
      date_generation: new Date().toISOString().split('T')[0]
    };
    
    // Update devis state
    setDevis([...devis, newDevis]);
    
    setLoading(false);
    return newDevis;
  };

  const getDevisByReservation = (reservationId: string): Devis | undefined => {
    return devis.find(d => d.reservation_id === reservationId);
  };

  const getPaymentByReservation = (reservationId: string): Payment | undefined => {
    return payments.find(p => p.reservation_id === reservationId);
  };

  return {
    payments,
    devis,
    loading,
    createPayment,
    uploadJustificatif,
    generateDevis,
    getDevisByReservation,
    getPaymentByReservation
  };
};
