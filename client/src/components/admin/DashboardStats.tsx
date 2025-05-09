import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Train, MapPin, Ticket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalTrains: number;
    totalStations: number;
    totalTickets: number;
    activeUsers: number;
    revenue: number;
    ticketsSold: number;
  } | undefined;
  isLoading: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: `${stats?.activeUsers || 0} active this month`,
    },
    {
      title: "Total Trains",
      value: stats?.totalTrains || 0,
      icon: Train,
      description: "Active trains in service",
    },
    {
      title: "Total Stations",
      value: stats?.totalStations || 0,
      icon: MapPin,
      description: "Stations across the network",
    },
    {
      title: "Tickets Sold",
      value: stats?.ticketsSold || 0,
      icon: Ticket,
      description: `৳${stats?.revenue?.toLocaleString() || 0} in revenue`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-20 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 