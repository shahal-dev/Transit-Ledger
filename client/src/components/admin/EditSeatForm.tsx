import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface EditSeatFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seat: any;
}

export function EditSeatForm({ open, onOpenChange, seat }: EditSeatFormProps) {
  const { useManageSeat, useAllTrains } = useAdmin();
  const manageSeat = useManageSeat();
  const { data: trains } = useAllTrains();
  
  const [formData, setFormData] = useState({
    trainId: "",
    seatNumber: "",
    seatClass: "",
    carNumber: "",
    position: "",
    features: {
      hasAC: false,
      hasPower: false,
      hasWifi: false,
      isReclining: false,
      hasFootrest: false
    }
  });

  // Load seat data when dialog opens
  useEffect(() => {
    if (seat && open) {
      setFormData({
        trainId: seat.trainId?.toString() || "",
        seatNumber: seat.seatNumber || "",
        seatClass: seat.seatClass || "economy",
        carNumber: seat.carNumber?.toString() || "1",
        position: seat.position || "aisle",
        features: {
          hasAC: seat.features?.hasAC || false,
          hasPower: seat.features?.hasPower || false,
          hasWifi: seat.features?.hasWifi || false,
          isReclining: seat.features?.isReclining || false,
          hasFootrest: seat.features?.hasFootrest || false
        }
      });
    }
  }, [seat, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [name]: checked
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      trainId: parseInt(formData.trainId),
      carNumber: parseInt(formData.carNumber)
    };
    
    manageSeat.mutate({
      seatId: seat.id,
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
          <DialogTitle>Edit Seat</DialogTitle>
          <DialogDescription>
            Make changes to the seat information below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                {trains?.map((train: any) => (
                  <SelectItem key={train.id} value={train.id.toString()}>
                    {train.name} ({train.trainNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seatNumber">Seat Number</Label>
              <Input 
                id="seatNumber" 
                name="seatNumber" 
                value={formData.seatNumber} 
                onChange={handleChange}
                placeholder="e.g. A1, B2"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="carNumber">Car Number</Label>
              <Input 
                id="carNumber" 
                name="carNumber" 
                type="number"
                min="1"
                value={formData.carNumber} 
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seatClass">Class</Label>
              <Select
                value={formData.seatClass}
                onValueChange={(value) => handleSelectChange("seatClass", value)}
              >
                <SelectTrigger id="seatClass">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first-class">First Class</SelectItem>
                  <SelectItem value="sleeper">Sleeper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => handleSelectChange("position", value)}
              >
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="window">Window</SelectItem>
                  <SelectItem value="aisle">Aisle</SelectItem>
                  <SelectItem value="middle">Middle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Features</Label>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasAC" 
                  checked={formData.features.hasAC}
                  onCheckedChange={(checked) => handleFeatureChange("hasAC", !!checked)}
                />
                <label
                  htmlFor="hasAC"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Air Conditioning
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasPower" 
                  checked={formData.features.hasPower}
                  onCheckedChange={(checked) => handleFeatureChange("hasPower", !!checked)}
                />
                <label
                  htmlFor="hasPower"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Power Outlet
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasWifi" 
                  checked={formData.features.hasWifi}
                  onCheckedChange={(checked) => handleFeatureChange("hasWifi", !!checked)}
                />
                <label
                  htmlFor="hasWifi"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  WiFi
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isReclining" 
                  checked={formData.features.isReclining}
                  onCheckedChange={(checked) => handleFeatureChange("isReclining", !!checked)}
                />
                <label
                  htmlFor="isReclining"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Reclining Seat
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasFootrest" 
                  checked={formData.features.hasFootrest}
                  onCheckedChange={(checked) => handleFeatureChange("hasFootrest", !!checked)}
                />
                <label
                  htmlFor="hasFootrest"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Foot Rest
                </label>
              </div>
            </div>
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
              disabled={manageSeat.isPending}
            >
              {manageSeat.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 