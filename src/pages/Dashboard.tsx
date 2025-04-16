
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Download, 
  Calendar as CalendarIcon, 
  FileText, 
  Users, 
  CreditCard, 
  Percent,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  Activity,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Generate sample data for charts
const generateReservationData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < 10; i++) {
    const date = subDays(today, i);
    data.unshift({
      name: format(date, 'dd/MM', { locale: fr }),
      total: Math.floor(Math.random() * 5) + 1,
      perenco: Math.floor(Math.random() * 3) + 1,
      parraine: Math.floor(Math.random() * 2),
      contractuel: Math.floor(Math.random() * 1),
    });
  }
  return data;
};

const generateRevenueData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i * 30);
    data.unshift({
      name: format(date, 'MMM', { locale: fr }),
      total: Math.floor(Math.random() * 1500000) + 300000,
    });
  }
  return data;
};

const reservationData = generateReservationData();
const revenueData = generateRevenueData();

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading, getStatsForPeriod, generateReport } = useDashboard();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [reportsLoading, setReportsLoading] = useState<{[key: string]: boolean}>({
    pdf: false,
    excel: false
  });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isAdminOrManager = isAdmin || isManager;

  useEffect(() => {
    // Load real-time data from Supabase when dashboard mounts
    const loadData = async () => {
      try {
        await getStatsForPeriod(dateRange.from, dateRange.to);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    
    loadData();
  }, []);

  // Function to determine if a metric has increased or decreased
  const getMetricChange = () => {
    // Random for demo, in real app would calculate from actual data
    return Math.random() > 0.5 ? 
      { value: `+${Math.floor(Math.random() * 10)}%`, trend: 'up' } : 
      { value: `-${Math.floor(Math.random() * 5)}%`, trend: 'down' };
  };

  const handleGenerateReport = async (format: 'pdf' | 'excel') => {
    try {
      setReportsLoading(prev => ({ ...prev, [format]: true }));
      const downloadUrl = await generateReport(format);
      
      toast({
        title: "Rapport généré avec succès",
        description: `Votre rapport ${format.toUpperCase()} est prêt à être téléchargé.`,
      });
      
      // In a real app, this would trigger a file download
      window.open(downloadUrl, '_blank');
    } catch (error) {
      toast({
        title: "Erreur lors de la génération du rapport",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setReportsLoading(prev => ({ ...prev, [format]: false }));
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">Bienvenue, {user?.prenom} {user?.nom}</p>
          </div>
          
          {isAdminOrManager && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2 hover-scale">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Période: {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange(range as { from: Date; to: Date });
                        getStatsForPeriod(range.from, range.to);
                      }
                    }}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="outline" 
                onClick={() => handleGenerateReport('pdf')}
                disabled={reportsLoading.pdf}
                className="hover-scale"
              >
                {reportsLoading.pdf ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                PDF
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleGenerateReport('excel')}
                disabled={reportsLoading.excel}
                className="hover-scale"
              >
                {reportsLoading.excel ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Excel
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover-effect overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-sm font-medium">
                Total Réservations
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total_reservations}</div>
              <div className="flex items-center mt-1">
                {getMetricChange().trend === 'up' ? (
                  <>
                    <ChevronUp className="h-4 w-4 text-green-500" />
                    <p className="text-xs text-green-500">{getMetricChange().value}</p>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 text-red-500" />
                    <p className="text-xs text-red-500">{getMetricChange().value}</p>
                  </>
                )}
                <p className="text-xs text-muted-foreground ml-2">
                  par rapport au mois dernier
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover-effect overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="text-sm font-medium">
                Taux d'Occupation
              </CardTitle>
              <Percent className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.taux_occupation}%</div>
              <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${stats.taux_occupation}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover-effect overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="text-sm font-medium">
                Revenus Totaux
              </CardTitle>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {stats.revenus_totaux.toLocaleString()} XAF
              </div>
              <div className="flex items-center mt-1">
                {getMetricChange().trend === 'up' ? (
                  <>
                    <Activity className="h-4 w-4 text-green-500" />
                    <p className="text-xs text-green-500 ml-1">{getMetricChange().value} mois en cours</p>
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 text-amber-500" />
                    <p className="text-xs text-amber-500 ml-1">{getMetricChange().value} mois en cours</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover-effect overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-amber-50 to-amber-100">
              <CardTitle className="text-sm font-medium">
                Utilisateurs
              </CardTitle>
              <Users className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.stats_utilisateurs.total}</div>
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle2 className="h-3 w-3" /> PERENCO: {stats.stats_utilisateurs.perenco}
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle2 className="h-3 w-3" /> Contractuels: {stats.stats_utilisateurs.contractuels}
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle2 className="h-3 w-3" /> Parrainés: {stats.stats_utilisateurs.parraines}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reservations" className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="reservations" className="data-[state=active]:bg-background">Réservations</TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-background">Revenus</TabsTrigger>
          </TabsList>
          <TabsContent value="reservations" className="animate-fade-in">
            <Card>
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle>Réservations par jour (10 derniers jours)</CardTitle>
                <CardDescription>
                  Visualisation des réservations par type d'utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2 pt-6">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={reservationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar 
                      dataKey="perenco" 
                      stackId="a" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                    <Bar 
                      dataKey="contractuel" 
                      stackId="a" 
                      fill="#10B981" 
                      radius={[0, 0, 0, 0]}
                      animationDuration={1500}
                      animationDelay={300}
                    />
                    <Bar 
                      dataKey="parraine" 
                      stackId="a" 
                      fill="#F59E0B" 
                      radius={[0, 0, 4, 4]}
                      animationDuration={1500}
                      animationDelay={600}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="revenue" className="animate-fade-in">
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardTitle>Revenus par mois</CardTitle>
                <CardDescription>
                  Évolution des revenus sur les 7 derniers mois
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2 pt-6">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString()} XAF`, 'Revenus']}
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#8B5CF6" 
                      strokeWidth={2} 
                      dot={{ r: 6, strokeWidth: 2, fill: 'white' }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: '#8B5CF6' }}
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isAdminOrManager && (
          <Card className="overflow-hidden animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle>Statistiques Utilisateurs</CardTitle>
              <CardDescription>
                Répartition des utilisateurs par type
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-white to-blue-50">
                  <div className="text-5xl font-bold text-blue-600 animate-enter">
                    {stats.stats_utilisateurs.perenco}
                  </div>
                  <div className="mt-2 text-sm font-medium text-blue-800">Personnel PERENCO</div>
                  <div className="mt-3 w-full bg-gray-200 h-1.5 rounded-full">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-700 ease-in-out" 
                      style={{ width: `${(stats.stats_utilisateurs.perenco / stats.stats_utilisateurs.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-white to-green-50">
                  <div className="text-5xl font-bold text-green-600 animate-enter">
                    {stats.stats_utilisateurs.contractuels}
                  </div>
                  <div className="mt-2 text-sm font-medium text-green-800">Contractuels</div>
                  <div className="mt-3 w-full bg-gray-200 h-1.5 rounded-full">
                    <div 
                      className="bg-green-600 h-1.5 rounded-full transition-all duration-700 ease-in-out" 
                      style={{ width: `${(stats.stats_utilisateurs.contractuels / stats.stats_utilisateurs.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-white to-yellow-50">
                  <div className="text-5xl font-bold text-yellow-600 animate-enter">
                    {stats.stats_utilisateurs.parraines}
                  </div>
                  <div className="mt-2 text-sm font-medium text-yellow-800">Parrainés</div>
                  <div className="mt-3 w-full bg-gray-200 h-1.5 rounded-full">
                    <div 
                      className="bg-yellow-600 h-1.5 rounded-full transition-all duration-700 ease-in-out" 
                      style={{ width: `${(stats.stats_utilisateurs.parraines / stats.stats_utilisateurs.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
