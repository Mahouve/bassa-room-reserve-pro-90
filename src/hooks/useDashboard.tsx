
import { useState, useEffect } from 'react';
import { DashboardStats } from '@/types';

// Sample data for demonstration
const MOCK_STATS: DashboardStats = {
  total_reservations: 42,
  taux_occupation: 68,
  revenus_totaux: 3250000,
  stats_utilisateurs: {
    total: 120,
    perenco: 80,
    contractuels: 30,
    parraines: 10
  }
};

interface DashboardHook {
  stats: DashboardStats;
  loading: boolean;
  getStatsForPeriod: (startDate: Date, endDate: Date) => Promise<DashboardStats>;
  generateReport: (format: 'pdf' | 'excel') => Promise<string>;
}

export const useDashboard = (): DashboardHook => {
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  const [loading, setLoading] = useState<boolean>(false);

  const getStatsForPeriod = async (startDate: Date, endDate: Date): Promise<DashboardStats> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would fetch stats for the specified period
    // For demo purposes, we'll generate some randomized stats
    const randomStat = (base: number, variance: number) => {
      return Math.floor(base * (1 + (Math.random() - 0.5) * variance));
    };
    
    const periodStats: DashboardStats = {
      total_reservations: randomStat(MOCK_STATS.total_reservations, 0.3),
      taux_occupation: Math.min(100, Math.max(0, randomStat(MOCK_STATS.taux_occupation, 0.2))),
      revenus_totaux: randomStat(MOCK_STATS.revenus_totaux, 0.25),
      stats_utilisateurs: {
        total: randomStat(MOCK_STATS.stats_utilisateurs.total, 0.1),
        perenco: randomStat(MOCK_STATS.stats_utilisateurs.perenco, 0.15),
        contractuels: randomStat(MOCK_STATS.stats_utilisateurs.contractuels, 0.2),
        parraines: randomStat(MOCK_STATS.stats_utilisateurs.parraines, 0.3)
      }
    };
    
    setStats(periodStats);
    setLoading(false);
    return periodStats;
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
