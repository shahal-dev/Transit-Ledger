import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTickets } from "@/hooks/use-tickets";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import CoachLayout from "./coach-layout";

interface BerthSelectorProps {
  schedule: any;
  onPriceChange: (price: number) => void;
}

export default function BerthSelector({ schedule, onPriceChange }: BerthSelectorProps) {
  const [selectedBerthType, setSelectedBerthType] = useState<string>("");
  const [selectedBerthScheduleId, setSelectedBerthScheduleId] = useState<number | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("select-type");
  
  const { useBookTicket } = useTickets();
  const [, navigate] = useLocation();
  const bookTicketMutation = useBookTicket();
  
  // Calculate total berth types and available seats
  const berthTypes = schedule.berthSchedules ? 
    schedule.berthSchedules.reduce((acc: any, berthSchedule: any) => {
      const berthType = berthSchedule.berth.type;
      const bookedSeats = JSON.parse(berthSchedule.bookedSeats || '[]');
      const totalSeats = berthSchedule.berth.totalSeats;
      const availableSeats = totalSeats - bookedSeats.length;
      
      if (!acc[berthType]) {
        acc[berthType] = {
          type: berthType,
          price: berthSchedule.pricePerSeat,
          totalSeats: 0,
          availableSeats: 0,
          berthSchedules: []
        };
      }
      
      acc[berthType].totalSeats += totalSeats;
      acc[berthType].availableSeats += availableSeats;
      acc[berthType].berthSchedules.push(berthSchedule);
      
      return acc;
    }, {}) : {};

  // Filtered berth schedules for the selected type
  const selectedTypeSchedules = selectedBerthType ? 
    berthTypes[selectedBerthType]?.berthSchedules || [] : [];
  
  // Selected berth schedule object
  const selectedBerthSchedule = selectedBerthScheduleId ? 
    selectedTypeSchedules.find((bs: any) => bs.id === selectedBerthScheduleId) : null;
  
  // Calculate prices
  const basePrice = selectedBerthSchedule ? selectedBerthSchedule.pricePerSeat : 0;
  const serviceFee = 20;
  const totalPrice = basePrice + serviceFee;
  
  // Update parent component with price
  useEffect(() => {
    onPriceChange(totalPrice);
  }, [totalPrice, onPriceChange]);
  
  // Handler for selecting a berth type
  const handleBerthTypeChange = (value: string) => {
    setSelectedBerthType(value);
    setSelectedBerthScheduleId(null);
    setSelectedSeat(null);
    setCurrentTab("select-type");
  };
  
  // Handler for selecting a berth
  const handleBerthSelect = (berthScheduleId: number) => {
    setSelectedBerthScheduleId(berthScheduleId);
    setSelectedSeat(null);
    setCurrentTab("select-seat");
  };
  
  // Handler for selecting a seat
  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeat(seatNumber);
  };
  
  // Book ticket handler
  const handleBookTicket = async () => {
    if (!selectedBerthScheduleId || !selectedSeat) return;
    
    try {
      const ticket = await bookTicketMutation.mutateAsync({
        scheduleId: schedule.id,
        seatNumber: selectedSeat,
        berthScheduleId: selectedBerthScheduleId
      });
      
      navigate(`/payment/${ticket.id}`);
    } catch (error) {
      console.error("Failed to book ticket:", error);
    }
  };
  
  // Check if there are any berth types available
  const hasBerthTypes = Object.keys(berthTypes).length > 0;
  
  // Check if the selected berth type has any available seats
  const hasBerthsAvailable = selectedBerthType && 
    berthTypes[selectedBerthType]?.availableSeats > 0;
  
  // Helper function to get coach type display name
  const getCoachTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'Ac_b': 'AC Berth',
      'AC_s': 'AC Seat',
      'Snigdha': 'Snigdha',
      'F_berth': 'First Berth',
      'F_seat': 'First Seat',
      'F_chair': 'First Chair',
      'S_chair': 'Second Chair',
      'Shovon': 'Shovon',
      'Shulov': 'Shulov',
      'Ac_chair': 'AC Chair'
    };
    
    return types[type] || type;
  };
  
  if (!hasBerthTypes) {
    return (
      <div className="pt-6 border-t mt-4 text-center">
        <h3 className="text-lg font-semibold text-destructive">No Seats Available</h3>
        <p className="text-neutral">No berths available for this schedule.</p>
      </div>
    );
  }
  
  return (
    <div className="pt-6 border-t mt-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Your Seat</h3>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="select-type">Coach Type</TabsTrigger>
            <TabsTrigger value="select-coach" disabled={!selectedBerthType}>Coach</TabsTrigger>
            <TabsTrigger value="select-seat" disabled={!selectedBerthScheduleId}>Seat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="select-type">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(berthTypes).map((berthType: any) => (
                <div 
                  key={berthType.type}
                  className={`p-4 border rounded-md cursor-pointer transition-all ${
                    selectedBerthType === berthType.type 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => berthType.availableSeats > 0 && handleBerthTypeChange(berthType.type)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{getCoachTypeDisplay(berthType.type)}</h4>
                      <p className="text-sm text-neutral">
                        {berthType.availableSeats} / {berthType.totalSeats} seats available
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10">৳{berthType.price}</Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedBerthType && (
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => setCurrentTab("select-coach")}
                  disabled={!hasBerthsAvailable}
                >
                  Next: Select Coach
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="select-coach">
            {selectedBerthType && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-neutral">
                    Selected Type: <span className="font-medium">{getCoachTypeDisplay(selectedBerthType)}</span>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm"
                      onClick={() => setCurrentTab("select-type")}
                    >
                      Change
                    </Button>
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {selectedTypeSchedules.map((berthSchedule: any) => {
                    const bookedSeats = JSON.parse(berthSchedule.bookedSeats || '[]');
                    const totalSeats = berthSchedule.berth.totalSeats;
                    const availableSeats = totalSeats - bookedSeats.length;
                    
                    return (
                      <div 
                        key={berthSchedule.id}
                        className={`p-4 border rounded-md cursor-pointer transition-all ${
                          selectedBerthScheduleId === berthSchedule.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-gray-400'
                        }`}
                        onClick={() => availableSeats > 0 && handleBerthSelect(berthSchedule.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Coach {berthSchedule.berth.coachNumber}</h4>
                            <p className="text-sm text-neutral">
                              {availableSeats} / {totalSeats} seats available
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-primary/10">৳{berthSchedule.pricePerSeat}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {selectedBerthScheduleId && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setCurrentTab("select-seat")}>
                      Next: Select Seat
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="select-seat">
            {selectedBerthSchedule && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-neutral mb-1">
                    Selected Type: <span className="font-medium">{getCoachTypeDisplay(selectedBerthType)}</span>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm"
                      onClick={() => setCurrentTab("select-type")}
                    >
                      Change
                    </Button>
                  </p>
                  <p className="text-sm text-neutral">
                    Selected Coach: <span className="font-medium">Coach {selectedBerthSchedule.berth.coachNumber}</span>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm"
                      onClick={() => setCurrentTab("select-coach")}
                    >
                      Change
                    </Button>
                  </p>
                </div>
                
                <Alert className="mb-4">
                  <AlertDescription>
                    Select a seat from the coach layout below. Tickets are sold on a first-come-first-serve basis. 
                    Once you select a seat, it will be temporarily reserved for you until you complete the payment.
                  </AlertDescription>
                </Alert>
                
                <CoachLayout
                  coachType={selectedBerthSchedule.berth.type}
                  coachNumber={selectedBerthSchedule.berth.coachNumber}
                  bookedSeats={JSON.parse(selectedBerthSchedule.bookedSeats || '[]')}
                  onSeatSelect={handleSeatSelect}
                  selectedSeat={selectedSeat}
                />
                
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span>Base Fare ({getCoachTypeDisplay(selectedBerthType)})</span>
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
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    className="bg-primary hover:bg-primary-dark" 
                    disabled={!selectedSeat || bookTicketMutation.isPending}
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
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 