
import { useState } from 'react';
import { Sponsorship } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SponsorshipOperationsHook {
  loading: boolean;
  createSponsorship: (sponsorshipData: Partial<Sponsorship>) => Promise<Sponsorship>;
  updateSponsorshipStatus: (id: string, newStatus: 'en attente' | 'validé' | 'refusé') => Promise<boolean>;
}

export const useSponsorshipOperations = (): SponsorshipOperationsHook => {
  const [loading, setLoading] = useState<boolean>(false);

  const createSponsorship = async (sponsorshipData: Partial<Sponsorship>): Promise<Sponsorship> => {
    setLoading(true);
    
    try {
      // Create sponsorship in Supabase
      const { data, error } = await supabase
        .from('sponsorships')
        .insert({
          sponsor_id: sponsorshipData.utilisateur_id || '',
          guest_name: sponsorshipData.nom_parraine || '',
          guest_email: sponsorshipData.contact_parraine || '',
          status: 'en attente',
          event_type: 'visit', // Default event type
          department_sponsor: 'Unknown', // Default department
          guest_company: 'Unknown', // Default company
          event_date: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating sponsorship:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de créer le parrainage. ' + error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Create sponsorship object from the response
      const sponsorship: Sponsorship = {
        id: data.id,
        utilisateur_id: data.sponsor_id,
        nom_parraine: data.guest_name,
        contact_parraine: data.guest_email,
        statut_validation: data.status as 'en attente' | 'validé' | 'refusé',
      };
      
      toast({
        title: 'Parrainage créé',
        description: `Le parrainage de ${sponsorship.nom_parraine} a été créé avec succès.`,
      });
      
      return sponsorship;
    } catch (error) {
      console.error('Error in createSponsorship:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSponsorshipStatus = async (id: string, newStatus: 'en attente' | 'validé' | 'refusé'): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('sponsorships')
        .update({
          status: newStatus,
          validation_date: newStatus !== 'en attente' ? new Date().toISOString() : null,
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating sponsorship status:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour le statut du parrainage. ' + error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateSponsorshipStatus:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createSponsorship,
    updateSponsorshipStatus
  };
};
