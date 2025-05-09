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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Loader2, Train, ArrowRight, Clock, Armchair } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface TicketDetailsProps {
  schedule: any;
  stations: any[];
  onBookTicket: (seatNumber: string) => void;
}

export default function TicketDetails({ schedule, stations, onBookTicket }: TicketDetailsProps) {
  const [selectedSeatClass, setSelectedSeatClass] = useState<string>("");
  const [selectedSeatScheduleId, setSelectedSeatScheduleId] = useState<number | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string>("");
  const { useBookTicket } = useTickets();
  const [, navigate] = useLocation();
  const bookTicketMutation = useBookTicket();
  
  // Handler for selecting a seat class
  const handleSeatClassChange = (value: string) => {
    setSelectedSeatClass(value);
    setSelectedSeat(""); // Reset selected seat when class changes
    setSelectedSeatScheduleId(null);
  };
  
  // Handler for selecting a specific seat
  const handleSeatSelect = (seatNumber: string, seatScheduleId: number) => {
    setSelectedSeat(seatNumber);
    setSelectedSeatScheduleId(seatScheduleId);
  };
  
  const handleBookTicket = async () => {
    if (!selectedSeat || !selectedSeatScheduleId) return;
    
    try {
      const ticket = await bookTicketMutation.mutateAsync({
        scheduleId: schedule.id,
        seatNumber: selectedSeat,
        seatScheduleId: selectedSeatScheduleId
      });
      navigate(`/payment/${ticket.id}`);
    } catch (error) {
      console.error("Failed to book ticket:", error);
    }
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
  
  // Get available seat classes from the schedule
  const seatClasses = schedule.seatClasses || {};
  const seatClassOptions = Object.entries(seatClasses).map(([className, data]: [string, any]) => ({
    value: className,
    label: className.charAt(0).toUpperCase() + className.slice(1),
    count: data.count,
    price: data.price
  }));
  
  // Get seats for selected class
  const availableSeats = selectedSeatClass ? seatClasses[selectedSeatClass]?.seats || [] : [];
  
  // Calculate price based on selected seat class
  const basePrice = selectedSeatClass ? seatClasses[selectedSeatClass]?.price || 0 : 0;
  const serviceFee = 20;
  const totalPrice = basePrice + serviceFee;
  
  // Check if there are any seat classes available
  const hasSeatClasses = seatClassOptions.length > 0;
  const hasAvailableSeats = availableSeats.length > 0;
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{trainName}</CardTitle>
        <CardDescription>Train #{trainNumber} - {formatDate(schedule.journeyDate)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4">
          <div>
            <p className="text-sm text-neutral">Departure</p>
            <p className="font-semibold">{fromStation}</p>
            <p className="text-lg font-mono">{departureTime}</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center w-full">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <div className="flex-1 h-0.5 bg-primary"></div>
              <Train className="h-5 w-5 text-primary mx-2" />
              <div className="flex-1 h-0.5 bg-primary"></div>
              <div className="h-2 w-2 rounded-full bg-primary"></div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-neutral">Arrival</p>
            <p className="font-semibold">{toStation}</p>
            <p className="text-lg font-mono">{arrivalTime}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-neutral mr-1" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center">
            <Train className="h-4 w-4 text-neutral mr-1" />
            <span>{trainType}</span>
          </div>
          <div className="flex items-center">
            <Armchair className="h-4 w-4 text-neutral mr-1" />
            <span>{schedule.availableSeats} seats available</span>
          </div>
        </div>
        
        {hasSeatClasses ? (
          <div className="pt-6 border-t mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Your Seat</h3>
              
              <Tabs defaultValue="select-class" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="select-class">Seat Class</TabsTrigger>
                  <TabsTrigger value="select-seat" disabled={!selectedSeatClass}>Seat Number</TabsTrigger>
                </TabsList>
                
                <TabsContent value="select-class">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {seatClassOptions.map(option => (
                      <div 
                        key={option.value}
                        className={`p-4 border rounded-md cursor-pointer transition-all ${selectedSeatClass === option.value ? 'border-primary bg-primary/5' : 'hover:border-gray-400'}`}
                        onClick={() => handleSeatClassChange(option.value)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{option.label} Class</h4>
                            <p className="text-sm text-neutral">{option.count} seats available</p>
                          </div>
                          <Badge variant="outline" className="bg-primary/10">৳{option.price}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="select-seat">
                  {hasAvailableSeats ? (
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-neutral">
                          Selected: <span className="font-medium">{selectedSeatClass.charAt(0).toUpperCase() + selectedSeatClass.slice(1)} Class</span>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-sm"
                            onClick={() => setSelectedSeatClass("")}
                          >
                            Change
                          </Button>
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {availableSeats.map(seat => (
                          <div 
                            key={seat.id}
                            className={`p-3 border rounded-md text-center cursor-pointer transition-all ${selectedSeat === seat.seatNumber ? 'border-primary bg-primary/5' : 'hover:border-gray-400'}`}
                            onClick={() => handleSeatSelect(seat.seatNumber, seat.id)}
                          >
                            <div className="font-medium">{seat.seatNumber}</div>
                            <div className="text-xs text-neutral">Car {seat.carNumber}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <p>No seats available for this class.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span>Base Fare ({selectedSeatClass ? selectedSeatClass.charAt(0).toUpperCase() + selectedSeatClass.slice(1) + ' Class' : ''})</span>
                  <span>৳{basePrice}</span>
                </div>
                <div className="flex justify-between text-neutral">
                  <span>Service Fee</span>
                  <span>৳{serviceFee}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>৳{totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-6 border-t mt-4 text-center">
            <h3 className="text-lg font-semibold text-destructive">No Seats Available</h3>
            <p className="text-neutral">No seats available for this schedule.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary-dark" 
          disabled={!selectedSeat || !selectedSeatScheduleId || bookTicketMutation.isPending}
          onClick={handleBookTicket}
        >
          {bookTicketMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Book Ticket - ৳${totalPrice}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
