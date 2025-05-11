import { useState } from "react";
import { useLocation } from "wouter";
import { useTickets } from "@/hooks/use-tickets";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Loader2, Train, ArrowRight, Clock, Armchair } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BerthSelector from "./berth-selector";

interface TicketDetailsProps {
  schedule: any;
  stations: any[];
}

export default function TicketDetails({ schedule, stations }: TicketDetailsProps) {
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const { useBookTicket } = useTickets();
  const [, navigate] = useLocation();
  const bookTicketMutation = useBookTicket();
  
  // Handler for price changes from BerthSelector
  const handlePriceChange = (price: number) => {
    setTotalPrice(price);
  };
  
  // Helper function to get station name
  const getStationName = (stationId: number) => {
    if (!stations) return "Unknown Station";
    const station = stations.find((s: any) => s.id === stationId);
    return station ? `${station.name}, ${station.city}` : "Unknown Station";
  };

  // Calculate trip duration
  const calculateDuration = () => {
    const departure = new Date(schedule.departureTime);
    const arrival = new Date(schedule.arrivalTime);
    const durationMs = arrival.getTime() - departure.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Get train information
  const trainName = schedule.train?.name || "Train";
  const trainNumber = schedule.train?.trainNumber || "Unknown";
  const trainType = schedule.train?.type || "Regular";
  const departureTime = new Date(schedule.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const arrivalTime = new Date(schedule.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const fromStation = getStationName(schedule.fromStationId);
  const toStation = getStationName(schedule.toStationId);
  const duration = calculateDuration();
  
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">
          {trainName} <Badge variant="outline">{trainNumber}</Badge>
        </CardTitle>
        <CardDescription>
          {formatDate(schedule.journeyDate)} | {trainType}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center">
              <Train className="h-4 w-4 mr-2 text-primary" />
              <div className="text-2xl font-semibold">{departureTime}</div>
            </div>
            <div className="text-sm text-neutral ml-6">{fromStation}</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-xs text-neutral">{duration}</div>
            <div className="w-16 md:w-24 h-0.5 bg-neutral-200 my-1 relative">
              <ArrowRight className="h-3 w-3 text-neutral-300 absolute -right-1 -top-1" />
            </div>
            <div className="text-xs text-neutral whitespace-nowrap">{schedule.journeyDate}</div>
          </div>
          
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <div className="text-2xl font-semibold">{arrivalTime}</div>
            </div>
            <div className="text-sm text-neutral mr-6">{toStation}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <div className="flex items-center">
              <Armchair className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Available Seats</span>
            </div>
            <div className="text-sm text-neutral ml-6">
              {schedule.availableSeats} seats available
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
          </Badge>
        </div>
        
        {/* Use the new BerthSelector component */}
        <BerthSelector 
          schedule={schedule} 
          onPriceChange={handlePriceChange}
        />
      </CardContent>
    </Card>
  );
}
