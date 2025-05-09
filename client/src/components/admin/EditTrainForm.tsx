import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditTrainFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  train: any;
}

export function EditTrainForm({ open, onOpenChange, train }: EditTrainFormProps) {
  const { useManageTrain, useAllStations } = useAdmin();
  const manageTrain = useManageTrain();
  const { data: stations } = useAllStations();
  
  const [formData, setFormData] = useState({
    name: "",
    trainNumber: "",
    fromStation: "",
    toStation: "",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    type: "",
    totalSeats: "",
    availableSeats: "",
    stationId: "none"
  });

  // Load train data when dialog opens
  useEffect(() => {
    if (train && open) {
      setFormData({
        name: train.name || "",
        trainNumber: train.trainNumber || "",
        fromStation: train.fromStation || "",
        toStation: train.toStation || "",
        departureTime: train.departureTime || "",
        arrivalTime: train.arrivalTime || "",
        duration: train.duration || "",
        type: train.type || "",
        totalSeats: train.totalSeats?.toString() || "",
        availableSeats: train.availableSeats?.toString() || "",
        stationId: train.stationId?.toString() || "none"
      });
    }
  }, [train, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      totalSeats: parseInt(formData.totalSeats),
      availableSeats: parseInt(formData.availableSeats),
      stationId: formData.stationId !== "none" ? parseInt(formData.stationId) : null
    };
    
    manageTrain.mutate({
      trainId: train.id,
      action: "edit",
      updates: payload
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Train</DialogTitle>
          <DialogDescription>
            Make changes to the train information below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Train Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trainNumber">Train Number</Label>
              <Input 
                id="trainNumber" 
                name="trainNumber" 
                value={formData.trainNumber} 
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromStation">From Station</Label>
              <Input 
                id="fromStation" 
                name="fromStation" 
                value={formData.fromStation} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toStation">To Station</Label>
              <Input 
                id="toStation" 
                name="toStation" 
                value={formData.toStation} 
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureTime">Departure Time</Label>
              <Input 
                id="departureTime" 
                name="departureTime" 
                value={formData.departureTime} 
                onChange={handleChange}
                placeholder="HH:MM"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="arrivalTime">Arrival Time</Label>
              <Input 
                id="arrivalTime" 
                name="arrivalTime" 
                value={formData.arrivalTime} 
                onChange={handleChange}
                placeholder="HH:MM"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input 
                id="duration" 
                name="duration" 
                value={formData.duration} 
                onChange={handleChange}
                placeholder="e.g. 5h 30m"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Express">Express</SelectItem>
                  <SelectItem value="Mail">Mail</SelectItem>
                  <SelectItem value="Commuter">Commuter</SelectItem>
                  <SelectItem value="Intercity">Intercity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalSeats">Total Seats</Label>
              <Input 
                id="totalSeats" 
                name="totalSeats" 
                type="number"
                value={formData.totalSeats} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="availableSeats">Available Seats</Label>
              <Input 
                id="availableSeats" 
                name="availableSeats" 
                type="number"
                value={formData.availableSeats} 
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stationId">Home Station</Label>
            <Select
              value={formData.stationId}
              onValueChange={(value) => handleSelectChange("stationId", value)}
            >
              <SelectTrigger id="stationId">
                <SelectValue placeholder="Select station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {stations?.map((station: any) => (
                  <SelectItem key={station.id} value={station.id.toString()}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={manageTrain.isPending}
            >
              {manageTrain.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 