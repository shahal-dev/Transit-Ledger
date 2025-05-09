import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: any;
}

export function EditScheduleForm({ open, onOpenChange, schedule }: EditScheduleFormProps) {
  const { useManageSchedule, useAllTrains } = useAdmin();
  const manageSchedule = useManageSchedule();
  const { data: trains } = useAllTrains();
  
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    trainId: "",
    status: "",
    availableSeats: ""
  });

  // Load schedule data when dialog opens
  useEffect(() => {
    if (schedule && open) {
      setFormData({
        trainId: schedule.trainId?.toString() || "",
        status: schedule.status || "scheduled",
        availableSeats: schedule.availableSeats?.toString() || ""
      });
      
      if (schedule.journeyDate) {
        setDate(new Date(schedule.journeyDate));
      }
    }
  }, [schedule, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      return;
    }
    
    const payload = {
      ...formData,
      trainId: parseInt(formData.trainId),
      journeyDate: format(date, "yyyy-MM-dd"),
      availableSeats: parseInt(formData.availableSeats)
    };
    
    manageSchedule.mutate({
      scheduleId: schedule.id,
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
          <DialogTitle>Edit Schedule</DialogTitle>
          <DialogDescription>
            Make changes to the schedule information below.
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
                {trains?.filter((train: any) => train.status === "active").map((train: any) => (
                  <SelectItem key={train.id} value={train.id.toString()}>
                    {train.name} ({train.trainNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                />
              </PopoverContent>
            </Popover>
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
                <SelectItem value="completed">Completed</SelectItem>
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
              disabled={manageSchedule.isPending || !date || !formData.trainId}
            >
              {manageSchedule.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 