
import { useState, useEffect } from 'react';
import { DashboardStats } from '@/types';

// Données vides pour réinitialiser le tableau de bord
const EMPTY_STATS: DashboardStats = {
  total_reservations: 0,
  taux_occupation: 0,
  revenus_totaux: 0,
  stats_utilisateurs: {
    total: 0,
    perenco: 0,
    contractuels: 0,
    parraines: 0
  }
};

interface DashboardHook {
  stats: DashboardStats;
  loading: boolean;
  getStatsForPeriod: (startDate: Date, endDate: Date) => Promise<DashboardStats>;
  generateReport: (format: 'pdf' | 'excel') => Promise<string>;
}

export const useDashboard = (): DashboardHook => {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState<boolean>(false);

  const getStatsForPeriod = async (startDate: Date, endDate: Date): Promise<DashboardStats> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return empty stats - we're resetting all data
    setStats(EMPTY_STATS);
    
    setLoading(false);
    return EMPTY_STATS;
  };

  const generateReport = async (format: 'pdf' | 'excel'): Promise<string> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would generate and return a download link
    const downloadUrl = `/reports/dashboard-report-${Date.now()}.${format}`;
    
    setLoading(false);
    return downloadUrl;
  };

  return {
    stats,
    loading,
    getStatsForPeriod,
    generateReport
  };
};
