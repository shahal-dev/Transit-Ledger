import { Schedule } from "@shared/types";
import { useTickets } from "@/hooks/use-tickets";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

interface AvailableTicketsProps {
  fromStation?: string;
  toStation?: string;
  date?: string;
}

export default function AvailableTickets({ fromStation, toStation, date }: AvailableTicketsProps) {
  const { useSchedules, useStations } = useTickets();
  const { data: schedulesData, isLoading: isLoadingSchedules, error: schedulesError } = useSchedules(date);
  const { data: stationsData, isLoading: isLoadingStations } = useStations();

  const isLoading = isLoadingSchedules || isLoadingStations;
  const error = schedulesError;

  // Filter schedules based on search criteria
  const filteredSchedules = (!isLoading && schedulesData) ? schedulesData.filter((schedule: Schedule) => {
    if (fromStation && schedule.fromStationId.toString() !== fromStation) {
      return false;
    }
    if (toStation && schedule.toStationId.toString() !== toStation) {
      return false;
    }
    return true;
  }) : [];

  // Helper function to get station name
  const getStationName = (stationId: number) => {
    if (!stationsData) return "Unknown";
    const station = stationsData.find((s: any) => s.id === stationId);
    return station ? `${station.name}, ${station.city}` : "Unknown";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading available tickets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardDescription>Failed to load available tickets. Please try again later.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!filteredSchedules || filteredSchedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Tickets Available</CardTitle>
          <CardDescription>
            {fromStation || toStation || date
              ? "No tickets found matching your search criteria."
              : "No tickets are currently available."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Available Tickets ({filteredSchedules.length})</h3>
      {filteredSchedules.map((schedule: Schedule) => (
        <Card key={schedule.id}>
          <CardContent className="p-6">
            <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{schedule.train?.name || "Unknown Train"}</h3>
                <p className="text-sm text-neutral">Train #{schedule.train?.trainNumber || "N/A"}</p>
                <p className="text-sm text-neutral">{formatDate(schedule.journeyDate)}</p>
                <p className="text-sm text-neutral">{schedule.availableSeats} seats available</p>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{getStationName(schedule.fromStationId)}</p>
                    <p className="text-sm font-mono">{new Date(schedule.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className="flex-1 border-t-2 border-dashed mx-2 border-gray-300"></div>
                  <div>
                    <p className="font-semibold">{getStationName(schedule.toStationId)}</p>
                    <p className="text-sm font-mono">{new Date(schedule.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                  <div className="text-right">
                    <p className="text-sm text-neutral">Starting from</p>
                    <p className="text-lg font-semibold">৳{schedule.price || "150"}</p>
                  </div>
                  <Button asChild>
                    <Link href={`/tickets/${schedule.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
          </div>
          </CardContent>
        </Card>
      ))}
      </div>
  );
}
