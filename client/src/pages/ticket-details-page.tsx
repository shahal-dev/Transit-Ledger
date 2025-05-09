import { useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useTickets } from "@/hooks/use-tickets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import TicketDetails from "@/components/tickets/ticket-details";

interface TicketDetailsPageProps {
  params: {
    id: string;
  }
}

export default function TicketDetailsPage({ params }: TicketDetailsPageProps) {
  const [, navigate] = useLocation();
  const { useSchedule, useStations } = useTickets();
  const scheduleId = parseInt(params.id);
  const { data: schedule, isLoading: scheduleLoading, error } = useSchedule(scheduleId);
  const { data: stations, isLoading: stationsLoading } = useStations();

  const isLoading = scheduleLoading || stationsLoading;

  const handleBookTicket = (seatNumber: string) => {
    // The booking logic is handled in the TicketDetails component
  };

  // Helper function to get station name
  const getStationName = (stationId: number) => {
    if (!stations) return "Unknown Station";
    const station = stations.find((s: any) => s.id === stationId);
    return station ? `${station.name}, ${station.city}` : "Unknown Station";
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Loading... | TransitLedger</title>
          <meta name="description" content="Loading ticket details" />
        </Helmet>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading ticket details...</span>
        </div>
      </div>
    );
  }
  
  if (error || !schedule) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Error | TransitLedger</title>
          <meta name="description" content="Error loading ticket details" />
        </Helmet>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>
              Failed to load schedule details. The schedule may not exist or has been cancelled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mt-2">Please try searching for another train or contact customer support.</p>
            <button 
              onClick={() => navigate("/tickets")}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Return to Ticket Search
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Create title and description with available data
  const trainName = schedule.train?.name || "Train";
  const fromStation = getStationName(schedule.fromStationId);
  const toStation = getStationName(schedule.toStationId);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{`${trainName} | Ticket Details | TransitLedger`}</title>
        <meta name="description" content={`Book your ticket for ${trainName} from ${fromStation} to ${toStation}.`} />
      </Helmet>
      
      <TicketDetails 
        schedule={schedule} 
        stations={stations}
        onBookTicket={handleBookTicket} 
      />
    </div>
  );
}
