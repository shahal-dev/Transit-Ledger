import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, Calendar, Ticket, Train, AlertCircle, MapPin, LayoutGrid } from "lucide-react";
import { useLocation } from "wouter";
import { useAdmin } from "@/hooks/use-admin";

// Import our components
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { DataTable } from "@/components/ui/data-table";
import { columns as userColumns } from "@/components/admin/tables/user-columns";
import { columns as trainColumns } from "@/components/admin/tables/train-columns";
import { columns as stationColumns } from "@/components/admin/tables/station-columns";
import { columns as scheduleColumns } from "@/components/admin/tables/schedule-columns";
import { columns as ticketColumns } from "@/components/admin/tables/ticket-columns";
import { columns as seatColumns } from "@/components/admin/tables/seat-columns";
import { CreateTrainForm } from "@/components/admin/CreateTrainForm";
import { CreateStationForm } from "@/components/admin/CreateStationForm";
import { CreateScheduleForm } from "@/components/admin/CreateScheduleForm";
import { CreateSeatForm } from "@/components/admin/CreateSeatForm";

// Admin page component
export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const {
    useAllUsers,
    useAllTickets,
    useAllTrains,
    useAllStations,
    useAllSeats,
    useAllSchedules,
    useDashboardStats,
  } = useAdmin();

  // Fetch data using our hooks
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useAllUsers();
  const { data: tickets, isLoading: ticketsLoading, refetch: refetchTickets } = useAllTickets();
  const { data: trains, isLoading: trainsLoading, refetch: refetchTrains } = useAllTrains();
  const { data: stations, isLoading: stationsLoading, refetch: refetchStations } = useAllStations();
  const { data: seats, isLoading: seatsLoading, refetch: refetchSeats } = useAllSeats();
  const { data: schedules, isLoading: schedulesLoading, refetch: refetchSchedules } = useAllSchedules();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();

  // Admin status is verified through the user object
  const isAdmin = user?.isAdmin;

  // Handle search form submission
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchTerm);
  }

  const handleRefresh = () => {
    refetchUsers();
    refetchTickets();
    refetchTrains();
    refetchStations();
    refetchSeats();
    refetchSchedules();
    refetchStats();
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access the admin panel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Admin Header */}
      <AdminHeader 
        user={user} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        handleSearch={handleSearch}
        onRefresh={handleRefresh}
      />

      <div className="flex-1 space-y-6 p-8 pt-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Overview Section - Always visible */}
        <div className="space-y-6">
          {/* Dashboard Stats */}
          <section>
            <DashboardStats stats={stats} isLoading={statsLoading} />
          </section>
        </div>

        {/* Tabs Section - For detailed data */}
        <div className="mt-8 pt-4 border-t">
          <h3 className="text-xl font-semibold mb-4">Detailed Management</h3>
          
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="bg-muted/60">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="trains" className="flex items-center gap-2">
                <Train className="h-4 w-4" />
                Trains
              </TabsTrigger>
              <TabsTrigger value="stations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Stations
              </TabsTrigger>
              <TabsTrigger value="schedules" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedules
              </TabsTrigger>
              <TabsTrigger value="seats" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Seats
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Tickets
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <DataTable
                columns={userColumns}
                data={users || []}
                isLoading={usersLoading}
                searchKey="email"
              />
            </TabsContent>

            {/* Trains Tab */}
            <TabsContent value="trains" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Trains</h3>
                <CreateTrainForm />
              </div>
              <DataTable
                columns={trainColumns}
                data={trains || []}
                isLoading={trainsLoading}
                searchKey="name"
              />
            </TabsContent>

            {/* Stations Tab */}
            <TabsContent value="stations" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Stations</h3>
                <CreateStationForm />
              </div>
              <DataTable
                columns={stationColumns}
                data={stations || []}
                isLoading={stationsLoading}
                searchKey="name"
              />
            </TabsContent>

            {/* Schedules Tab */}
            <TabsContent value="schedules" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Train Schedules</h3>
                <CreateScheduleForm />
              </div>
              <DataTable
                columns={scheduleColumns}
                data={schedules || []}
                isLoading={schedulesLoading}
                searchKey="trainName"
              />
            </TabsContent>

            {/* Seats Tab */}
            <TabsContent value="seats" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Seats</h3>
                <CreateSeatForm />
              </div>
              <DataTable
                columns={seatColumns}
                data={seats || []}
                isLoading={seatsLoading}
                searchKey="seatNumber"
              />
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Tickets</h3>
                <div className="text-sm text-muted-foreground">Tickets can only be purchased by users</div>
              </div>
              <DataTable
                columns={ticketColumns}
                data={tickets || []}
                isLoading={ticketsLoading}
                searchKey="ticketHash"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 