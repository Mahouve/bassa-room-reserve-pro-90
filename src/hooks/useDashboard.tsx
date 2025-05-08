import { useState, useEffect } from 'react';
import { DashboardStats } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';

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
  reservationData: any[];
  revenueData: any[];
}

export const useDashboard = (): DashboardHook => {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState<boolean>(false);
  const [reservationData, setReservationData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  // Fonction pour récupérer les statistiques
  const getStatsForPeriod = async (startDate: Date, endDate: Date): Promise<DashboardStats> => {
    setLoading(true);
    
    try {
      // Fetch reservations for the selected period
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('end_time', endDate.toISOString());
      
      if (reservationsError) {
        console.error('Error fetching reservations for dashboard:', reservationsError);
        setLoading(false);
        return EMPTY_STATS;
      }

      // Log pour vérifier que les réservations sont bien récupérées
      console.log('Retrieved reservations for dashboard:', reservationsData);

      // Fetch users data for statistics
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) {
        console.error('Error fetching users for dashboard:', usersError);
      }

      // Calculate statistics based on the data
      const totalReservations = reservationsData?.length || 0;
      
      // Calculate occupancy rate (simplified for this example - assumes 3 slots per day)
      const dayRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPossibleSlots = dayRange * 3; // 3 slots per day
      const tauxOccupation = totalPossibleSlots > 0 
        ? Math.round((totalReservations / totalPossibleSlots) * 100)
        : 0;
      
      // Calculate revenue (simplified - assuming fixed price per reservation)
      const basePrixReservation = 50000; // 50,000 XAF per reservation
      const revenusTotaux = totalReservations * basePrixReservation;
      
      // User statistics - Using role or other property instead of user_type
      const perencoUsers = usersData?.filter(u => u.role === 'PERENCO' || u.department === 'PERENCO').length || 0;
      const contractuelUsers = usersData?.filter(u => u.role === 'contractuel' || u.department === 'contractuel').length || 0;
      const parraineUsers = usersData?.filter(u => u.role === 'parraine' || u.department === 'parraine').length || 0;
      const totalUsers = perencoUsers + contractuelUsers + parraineUsers;

      // Create updated stats
      const updatedStats: DashboardStats = {
        total_reservations: totalReservations,
        taux_occupation: tauxOccupation,
        revenus_totaux: revenusTotaux,
        stats_utilisateurs: {
          total: totalUsers,
          perenco: perencoUsers,
          contractuels: contractuelUsers,
          parraines: parraineUsers
        }
      };
      
      setStats(updatedStats);
      
      // Generate reservation data for chart
      generateReservationsChart(reservationsData || []);
      
      // Generate revenue data for chart
      generateRevenueChart(reservationsData || []);
      
      setLoading(false);
      return updatedStats;
    } catch (error) {
      console.error('Error in getStatsForPeriod:', error);
      setLoading(false);
      return EMPTY_STATS;
    }
  };

  const generateReservationsChart = (reservationsData: any[]) => {
    // Generate data for last 10 days
    const chartData = [];
    for (let i = 9; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Map user types from the reservations data
      // Using 'status' or other property instead of 'user_type'
      const perencoCount = reservationsData.filter(r => 
        format(parseISO(r.start_time), 'yyyy-MM-dd') === dateStr && 
        (r.status === 'PERENCO' || r.user_role === 'PERENCO')
      ).length;
      
      const contractuelCount = reservationsData.filter(r => 
        format(parseISO(r.start_time), 'yyyy-MM-dd') === dateStr && 
        (r.status === 'contractuel' || r.user_role === 'contractuel')
      ).length;
      
      const parraineCount = reservationsData.filter(r => 
        format(parseISO(r.start_time), 'yyyy-MM-dd') === dateStr && 
        (r.status === 'parraine' || r.user_role === 'parraine')
      ).length;

      // Fallback - if no user type info, count all reservations for that day
      const totalForDay = reservationsData.filter(r =>
        format(parseISO(r.start_time), 'yyyy-MM-dd') === dateStr
      ).length;
      
      // If we have no detailed breakdown but we have reservations, assume they're PERENCO
      const adjustedPerencoCount = (perencoCount === 0 && contractuelCount === 0 && parraineCount === 0 && totalForDay > 0) 
        ? totalForDay 
        : perencoCount;
      
      chartData.push({
        name: format(date, 'dd/MM'),
        perenco: adjustedPerencoCount,
        contractuel: contractuelCount,
        parraine: parraineCount,
        total: adjustedPerencoCount + contractuelCount + parraineCount || totalForDay,
      });
    }
    
    setReservationData(chartData);
  };

  const generateRevenueChart = (reservationsData: any[]) => {
    // Generate monthly revenue data for last 7 months
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i * 30);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      // Count reservations in this month
      const monthReservations = reservationsData.filter(r => {
        const resDate = parseISO(r.start_time);
        return resDate >= monthStart && resDate <= monthEnd;
      });
      
      // Calculate revenue (simplified)
      const basePrixReservation = 50000; // 50,000 XAF per reservation
      const monthRevenue = monthReservations.length * basePrixReservation;
      
      chartData.push({
        name: format(date, 'MMM'),
        total: monthRevenue,
      });
    }
    
    setRevenueData(chartData);
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

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Get stats for the last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30);
      await getStatsForPeriod(thirtyDaysAgo, new Date());
    };
    
    loadInitialData();
    
    // Set up subscription to reservations changes
    const reservationsChannel = supabase
      .channel('dashboard-reservations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          console.log('Reservations changed, updating dashboard data:', payload);
          // Refresh the stats when reservations change
          const thirtyDaysAgo = subDays(new Date(), 30);
          getStatsForPeriod(thirtyDaysAgo, new Date());
        }
      )
      .subscribe();
      
    // Cleanup subscription
    return () => {
      supabase.removeChannel(reservationsChannel);
    };
  }, []);

  return {
    stats,
    loading,
    getStatsForPeriod,
    generateReport,
    reservationData,
    revenueData
  };
};
