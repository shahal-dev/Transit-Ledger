import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CreateSeatScheduleForm() {
  const [open, setOpen] = useState(false);
  const { useManageSeatSchedule, useAllSchedules } = useAdmin();
  const manageSeatSchedule = useManageSeatSchedule();
  const { data: schedules } = useAllSchedules();
  
  const [formData, setFormData] = useState({
    scheduleId: "",
    priceMap: {
      economy: "50",
      business: "100",
      "first-class": "150",
      sleeper: "75"
    }
  });

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      priceMap: {
        ...prev.priceMap,
        [name]: value
      }
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmationDialogOpen(true);
  };

  const confirmBulkCreate = () => {
    if (!formData.scheduleId) {
      return;
    }

    // Convert string prices to numbers
    const priceMap = Object.entries(formData.priceMap).reduce((acc, [key, value]) => {
      acc[key] = parseFloat(value);
      return acc;
    }, {} as Record<string, number>);
    
    manageSeatSchedule.mutate({
      action: "create-bulk",
      scheduleId: parseInt(formData.scheduleId),
      updates: {
        priceMap
      }
    }, {
      onSuccess: () => {
        // Reset form and close dialog
        setFormData({
          scheduleId: "",
          priceMap: {
            economy: "50",
            business: "100",
            "first-class": "150",
            sleeper: "75"
          }
        });
        setConfirmationDialogOpen(false);
        setOpen(false);
      }
    });
  };

  // Helper function to get schedule display text
  const getScheduleText = (schedule: any) => {
    if (!schedule) return "Unknown Schedule";
    
    const trainName = schedule.train?.name || "Unknown Train";
    const fromStation = schedule.fromStation?.name || "Unknown";
    const toStation = schedule.toStation?.name || "Unknown";
    const date = schedule.journeyDate || "Unknown Date";
    
    return `${trainName}: ${fromStation} to ${toStation} (${date})`;
  };

  // Find the selected schedule
  const selectedSchedule = schedules?.find((s: any) => s.id.toString() === formData.scheduleId);

  // Check if schedule already has seat schedules
  const hasSeatSchedules = selectedSchedule?.seatSchedules?.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Schedule Seats
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Seats for Journey</DialogTitle>
            <DialogDescription>
              Add seats to a schedule with pricing based on seat class.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleId">Journey</Label>
              <Select
                value={formData.scheduleId}
                onValueChange={(value) => handleSelectChange("scheduleId", value)}
              >
                <SelectTrigger id="scheduleId">
                  <SelectValue placeholder="Select a journey" />
                </SelectTrigger>
                <SelectContent>
                  {schedules?.filter((schedule: any) => schedule.status !== "cancelled").map((schedule: any) => (
                    <SelectItem key={schedule.id} value={schedule.id.toString()}>
                      {getScheduleText(schedule)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSchedule && hasSeatSchedules && (
              <Alert variant="warning">
                <AlertDescription>
                  This schedule already has {selectedSchedule.seatSchedules.length} seats assigned. 
                  Adding more seats will not affect existing seat schedules.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <Label>Seat Pricing by Class</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="economy">Economy Class Price</Label>
                  <Input 
                    id="economy" 
                    name="economy" 
                    type="number"
                    min="0"
                    value={formData.priceMap.economy} 
                    onChange={handleChange}
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
                    value={formData.priceMap.business} 
                    onChange={handleChange}
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
                    value={formData.priceMap["first-class"]} 
                    onChange={handleChange}
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
                    value={formData.priceMap.sleeper} 
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={manageSeatSchedule.isPending || !formData.scheduleId}
              >
                Preview Seats
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Seat Scheduling</DialogTitle>
            <DialogDescription>
              You are about to schedule all available seats for this journey with the following pricing:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="border rounded p-4">
              <h4 className="font-semibold mb-2">Journey Details</h4>
              <p>{selectedSchedule ? getScheduleText(selectedSchedule) : "Unknown Schedule"}</p>
            </div>
            
            <div className="border rounded p-4">
              <h4 className="font-semibold mb-2">Pricing</h4>
              <ul className="space-y-1">
                <li>Economy: ${formData.priceMap.economy}</li>
                <li>Business: ${formData.priceMap.business}</li>
                <li>First Class: ${formData.priceMap["first-class"]}</li>
                <li>Sleeper: ${formData.priceMap.sleeper}</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setConfirmationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmBulkCreate}
              disabled={manageSeatSchedule.isPending}
            >
              {manageSeatSchedule.isPending ? "Processing..." : "Confirm & Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 