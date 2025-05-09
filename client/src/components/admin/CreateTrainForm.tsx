import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";

export function CreateTrainForm() {
  const [open, setOpen] = useState(false);
  const { useManageTrain } = useAdmin();
  const manageTrain = useManageTrain();
  
  const [formData, setFormData] = useState({
    name: "",
    trainNumber: "",
    type: "Express",
    status: "active"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    manageTrain.mutate({
      action: "create",
      updates: formData
    }, {
      onSuccess: () => {
        // Reset form and close dialog
        setFormData({
          name: "",
          trainNumber: "",
          type: "Express",
          status: "active"
        });
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Train
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Train</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new train to the system.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Train Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                placeholder="e.g. Rajdhani Express"
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
                placeholder="e.g. 12301"
                required
              />
            </div>
          </div>
          
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
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={manageTrain.isPending}
            >
              {manageTrain.isPending ? "Creating..." : "Create Train"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 