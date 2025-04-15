
import React, { useState } from 'react';
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
import { Download, Calendar as CalendarIcon, FileText, Users, CreditCard, Percent } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isAdminOrManager = isAdmin || isManager;

  const handleGenerateReport = async (format: 'pdf' | 'excel') => {
    const downloadUrl = await generateReport(format);
    
    // In a real app, this would trigger a file download
    alert(`Rapport généré. Dans une application réelle, le fichier ${format} serait téléchargé.`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">Bienvenue, {user?.prenom} {user?.nom}</p>
          </div>
          
          {isAdminOrManager && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Période</span>
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
              
              <Button variant="outline" onClick={() => handleGenerateReport('pdf')}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              
              <Button variant="outline" onClick={() => handleGenerateReport('excel')}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Réservations
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_reservations}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(Math.random() * 10)}% par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Taux d'Occupation
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.taux_occupation}%</div>
              <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                <div 
                  className="h-full bg-perenco-accent rounded-full"
                  style={{ width: `${stats.taux_occupation}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Revenus Totaux
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.revenus_totaux.toLocaleString()} XAF
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.floor(Math.random() * 1000000).toLocaleString()} XAF ce mois-ci
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats_utilisateurs.total}</div>
              <div className="flex gap-2 mt-2">
                <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  PERENCO: {stats.stats_utilisateurs.perenco}
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  Contractuels: {stats.stats_utilisateurs.contractuels}
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  Parrainés: {stats.stats_utilisateurs.parraines}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reservations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reservations">Réservations</TabsTrigger>
            <TabsTrigger value="revenue">Revenus</TabsTrigger>
          </TabsList>
          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle>Réservations par jour (10 derniers jours)</CardTitle>
                <CardDescription>
                  Visualisation des réservations par type d'utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={reservationData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="perenco" stackId="a" fill="#3B82F6" />
                    <Bar dataKey="contractuel" stackId="a" fill="#10B981" />
                    <Bar dataKey="parraine" stackId="a" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenus par mois</CardTitle>
                <CardDescription>
                  Évolution des revenus sur les 7 derniers mois
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={revenueData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString()} XAF`, 'Revenus']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#3B82F6" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isAdminOrManager && (
          <Card>
            <CardHeader>
              <CardTitle>Statistiques Utilisateurs</CardTitle>
              <CardDescription>
                Répartition des utilisateurs par type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="text-5xl font-bold text-blue-600">
                    {stats.stats_utilisateurs.perenco}
                  </div>
                  <div className="mt-2 text-sm font-medium text-blue-800">Personnel PERENCO</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="text-5xl font-bold text-green-600">
                    {stats.stats_utilisateurs.contractuels}
                  </div>
                  <div className="mt-2 text-sm font-medium text-green-800">Contractuels</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                  <div className="text-5xl font-bold text-yellow-600">
                    {stats.stats_utilisateurs.parraines}
                  </div>
                  <div className="mt-2 text-sm font-medium text-yellow-800">Parrainés</div>
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
