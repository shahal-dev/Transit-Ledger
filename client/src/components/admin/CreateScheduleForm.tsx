import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export function CreateScheduleForm() {
  const [open, setOpen] = useState(false);
  const { useManageSchedule, useAllTrains, useAllStations } = useAdmin();
  const manageSchedule = useManageSchedule();
  const { data: trains } = useAllTrains();
  const { data: stations } = useAllStations();
  
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    trainId: "",
    fromStationId: "",
    toStationId: "",
    departureTime: "",
    arrivalTime: "",
    availableSeats: "0",
    status: "scheduled",
    seatPricing: {
      economy: "50",
      business: "100",
      "first-class": "150",
      sleeper: "75"
    },
    seatsPerClass: {
      economy: 30,
      business: 20,
      "first-class": 10,
      sleeper: 0
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSeatPricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      seatPricing: {
        ...prev.seatPricing,
        [name]: value
      }
    }));
  };

  const handleSeatsPerClassChange = (className: string, increment: boolean) => {
    setFormData(prev => {
      const currentValue = prev.seatsPerClass[className as keyof typeof prev.seatsPerClass] || 0;
      const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
      
      // Also update total available seats
      const totalSeats = Object.entries(prev.seatsPerClass)
        .reduce((sum, [key, value]) => {
          return sum + (key === className ? newValue : value);
        }, 0);
      
      return {
        ...prev,
        availableSeats: totalSeats.toString(),
        seatsPerClass: {
          ...prev.seatsPerClass,
          [className]: newValue
        }
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !formData.trainId || !formData.fromStationId || !formData.toStationId) {
      return;
    }
    
    // Create combined datetime objects for departure and arrival
    const departureDateTime = new Date(date);
    const [depHours, depMinutes] = formData.departureTime.split(':').map(Number);
    departureDateTime.setHours(depHours, depMinutes);
    
    const arrivalDateTime = new Date(date);
    const [arrHours, arrMinutes] = formData.arrivalTime.split(':').map(Number);
    arrivalDateTime.setHours(arrHours, arrMinutes);
    
    // If arrival is earlier than departure, it's probably the next day
    if (arrivalDateTime < departureDateTime) {
      arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
    }
    
    const payload = {
      trainId: parseInt(formData.trainId),
      fromStationId: parseInt(formData.fromStationId),
      toStationId: parseInt(formData.toStationId),
      departureTime: departureDateTime.toISOString(),
      arrivalTime: arrivalDateTime.toISOString(),
      journeyDate: format(date, "yyyy-MM-dd"),
      availableSeats: parseInt(formData.availableSeats),
      status: formData.status,
      seatConfiguration: {
        seatPricing: formData.seatPricing,
        seatsPerClass: formData.seatsPerClass
      }
    };
    
    manageSchedule.mutate({
      action: "create",
      updates: payload
    }, {
      onSuccess: () => {
        // Reset form and close dialog
        setFormData({
          trainId: "",
          fromStationId: "",
          toStationId: "",
          departureTime: "",
          arrivalTime: "",
          availableSeats: "0",
          status: "scheduled",
          seatPricing: {
            economy: "50",
            business: "100",
            "first-class": "150",
            sleeper: "75"
          },
          seatsPerClass: {
            economy: 30,
            business: 20,
            "first-class": 10,
            sleeper: 0
          }
        });
        setDate(undefined);
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Schedule</DialogTitle>
          <DialogDescription>
            Create a new train journey schedule with route, timings, and seat configurations.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="journey" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="journey">Journey Details</TabsTrigger>
            <TabsTrigger value="seats">Seat Configuration</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-4">
            <TabsContent value="journey" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trainId">Train</Label>
                <Select
                  value={formData.trainId}
                  onValueChange={(value) => handleSelectChange("trainId", value)}
                >
                  <SelectTrigger id="trainId">
                    <SelectValue placeholder="Select a train" />
                  </SelectTrigger>
                  <SelectContent>
                    {trains?.filter((train: any) => train.status === "active").map((train: any) => (
                      <SelectItem key={train.id} value={train.id.toString()}>
                        {train.name} ({train.trainNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromStationId">From Station</Label>
                  <Select
                    value={formData.fromStationId}
                    onValueChange={(value) => handleSelectChange("fromStationId", value)}
                  >
                    <SelectTrigger id="fromStationId">
                      <SelectValue placeholder="Departure" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations?.filter((station: any) => station.status === "operational").map((station: any) => (
                        <SelectItem key={station.id} value={station.id.toString()}>
                          {station.name}, {station.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="toStationId">To Station</Label>
                  <Select
                    value={formData.toStationId}
                    onValueChange={(value) => handleSelectChange("toStationId", value)}
                  >
                    <SelectTrigger id="toStationId">
                      <SelectValue placeholder="Arrival" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations?.filter((station: any) => 
                        station.status === "operational" && station.id.toString() !== formData.fromStationId
                      ).map((station: any) => (
                        <SelectItem key={station.id} value={station.id.toString()}>
                          {station.name}, {station.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Journey Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="departureTime" 
                      name="departureTime" 
                      value={formData.departureTime} 
                      onChange={handleChange}
                      placeholder="HH:MM"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="arrivalTime">Arrival Time</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="arrivalTime" 
                      name="arrivalTime" 
                      value={formData.arrivalTime} 
                      onChange={handleChange}
                      placeholder="HH:MM"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="seats" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Seat Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure seat classes, quantities, and pricing for this journey.
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="text-md font-medium mb-4">Seats by Class</h4>
                  <div className="space-y-4">
                    {Object.entries(formData.seatsPerClass).map(([className, count]) => (
                      <div key={className} className="flex items-center justify-between">
                        <span className="capitalize">{className.replace('-', ' ')} Class</span>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => handleSeatsPerClassChange(className, false)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="h-8 px-3 flex items-center justify-center border-y">
                            {count}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => handleSeatsPerClassChange(className, true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between font-medium">
                        <span>Total Seats</span>
                        <span>{formData.availableSeats}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="border rounded-md p-4">
                  <h4 className="text-md font-medium mb-4">Pricing by Class</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="economy">Economy Class Price</Label>
                      <Input 
                        id="economy" 
                        name="economy" 
                        type="number"
                        min="0"
                        value={formData.seatPricing.economy} 
                        onChange={handleSeatPricingChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business">Business Class Price</Label>
                      <Input 
                        id="business" 
                        name="business" 
                        type="number"
                        min="0"
                        value={formData.seatPricing.business} 
                        onChange={handleSeatPricingChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="first-class">First Class Price</Label>
                      <Input 
                        id="first-class" 
                        name="first-class" 
                        type="number"
                        min="0"
                        value={formData.seatPricing["first-class"]} 
                        onChange={handleSeatPricingChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sleeper">Sleeper Class Price</Label>
                      <Input 
                        id="sleeper" 
                        name="sleeper" 
                        type="number"
                        min="0"
                        value={formData.seatPricing.sleeper} 
                        onChange={handleSeatPricingChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <div className="flex justify-end mt-6 space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={
                  manageSchedule.isPending ||
                  !date || 
                  !formData.trainId ||
                  !formData.fromStationId ||
                  !formData.toStationId ||
                  !formData.departureTime ||
                  !formData.arrivalTime ||
                  parseInt(formData.availableSeats) === 0
                }
              >
                {manageSchedule.isPending ? "Creating..." : "Create Schedule"}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 