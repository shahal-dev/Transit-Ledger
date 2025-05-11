import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function CreateBerthScheduleForm() {
  const [open, setOpen] = useState(false);
  const { useManageBerthSchedule, useAllSchedules, useAllBerths } = useAdmin();
  const manageBerthSchedule = useManageBerthSchedule();
  const { data: schedules } = useAllSchedules();
  const { data: berths } = useAllBerths();
  
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [selectedTrainId, setSelectedTrainId] = useState<number | null>(null);
  const [filteredBerths, setFilteredBerths] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    scheduleId: "",
    berthIds: [] as string[],
    priceMap: {} as Record<string, number>
  });
  
  // When schedule selection changes, filter berths by train
  useEffect(() => {
    if (formData.scheduleId && schedules) {
      const schedule = schedules.find((s: any) => s.id.toString() === formData.scheduleId);
      setSelectedSchedule(schedule);
      
      if (schedule) {
        setSelectedTrainId(schedule.trainId);
      }
    } else {
      setSelectedSchedule(null);
      setSelectedTrainId(null);
    }
  }, [formData.scheduleId, schedules]);
  
  // Filter berths by train ID
  useEffect(() => {
    if (selectedTrainId && berths) {
      const filtered = berths.filter((berth: any) => berth.trainId === selectedTrainId);
      setFilteredBerths(filtered);
      
      // Initialize price map with default prices
      const initialPriceMap: Record<string, number> = {};
      
      // Group by berth type for pricing
      const berthTypeMap = filtered.reduce((acc: Record<string, boolean>, berth: any) => {
        if (!acc[berth.type]) {
          acc[berth.type] = true;
          // Set default prices by berth type
          switch (berth.type) {
            case 'Ac_b':
            case 'AC_s':
            case 'Ac_chair':
              initialPriceMap[berth.type] = 500;
              break;
            case 'F_berth':
            case 'F_seat':
            case 'F_chair':
            case 'Snigdha':
              initialPriceMap[berth.type] = 400;
              break;
            case 'S_chair':
              initialPriceMap[berth.type] = 300;
              break;
            case 'Shovon':
            case 'Shulov':
              initialPriceMap[berth.type] = 200;
              break;
            default:
              initialPriceMap[berth.type] = 250;
          }
        }
        return acc;
      }, {});
      
      setFormData(prev => ({
        ...prev,
        berthIds: [],
        priceMap: initialPriceMap
      }));
      
    } else {
      setFilteredBerths([]);
    }
  }, [selectedTrainId, berths]);
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBerthSelection = (berthId: string) => {
    setFormData(prev => {
      const berthIds = [...prev.berthIds];
      
      if (berthIds.includes(berthId)) {
        // Remove if already selected
        return {
          ...prev,
          berthIds: berthIds.filter(id => id !== berthId)
        };
      } else {
        // Add if not already selected
        return {
          ...prev,
          berthIds: [...berthIds, berthId]
        };
      }
    });
  };
  
  const handlePriceChange = (berthType: string, value: string) => {
    const price = parseFloat(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      priceMap: {
        ...prev.priceMap,
        [berthType]: price
      }
    }));
  };
  
  const getScheduleText = (schedule: any) => {
    return `${schedule.train?.name || 'Unknown'} (${schedule.fromStation?.name || 'Unknown'} - ${schedule.toStation?.name || 'Unknown'}) - ${formatDate(schedule.journeyDate)}`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.berthIds.length === 0) {
        alert("Please select at least one berth");
        return;
      }
      
      await manageBerthSchedule.mutateAsync({
        action: "create-bulk",
        scheduleId: parseInt(formData.scheduleId),
        data: {
          berthIds: formData.berthIds.map(id => parseInt(id)),
          priceMap: formData.priceMap
        }
      });
      
      setOpen(false);
      
      // Reset form
      setFormData({
        scheduleId: "",
        berthIds: [],
        priceMap: {}
      });
    } catch (error) {
      console.error("Failed to create berth schedules:", error);
    }
  };
  
  // Group berths by type for the UI
  const groupedBerths = filteredBerths.reduce((acc: Record<string, any[]>, berth: any) => {
    if (!acc[berth.type]) {
      acc[berth.type] = [];
    }
    
    acc[berth.type].push(berth);
    return acc;
  }, {});
  
  // Check if any berths from this train are already scheduled
  const hasBerthSchedules = selectedSchedule?.berthSchedules?.length > 0;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Schedule Berths
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Berths for Journey</DialogTitle>
          <DialogDescription>
            Assign coach berths to a schedule with pricing based on coach type.
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
          
          {selectedSchedule && hasBerthSchedules && (
            <Alert variant="warning">
              <AlertDescription>
                This schedule already has {selectedSchedule.berthSchedules.length} berths assigned. 
                Adding more berths will not affect existing berth schedules.
              </AlertDescription>
            </Alert>
          )}
          
          {selectedSchedule && (
            <>
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Pricing by Coach Type</h3>
                <p className="text-sm text-neutral mb-4">
                  Set the base price for each coach type. All coaches of the same type will have the same base price.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(formData.priceMap).map(berthType => (
                    <div key={berthType} className="flex items-center space-x-2">
                      <Label htmlFor={`price-${berthType}`} className="flex-1">
                        {berthType.replace('_', ' ')}:
                      </Label>
                      <Input
                        id={`price-${berthType}`}
                        type="number"
                        min="0"
                        step="10"
                        value={formData.priceMap[berthType].toString()}
                        onChange={(e) => handlePriceChange(berthType, e.target.value)}
                        className="w-24"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Available Berths</h3>
                <p className="text-sm text-neutral mb-4">
                  Select the berths to include in this schedule. Berths from the same coach type will have the same pricing.
                </p>
                
                {Object.entries(groupedBerths).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedBerths).map(([type, typeBerths]) => (
                      <div key={type} className="border rounded-md p-4">
                        <h4 className="font-medium mb-2">
                          {type.replace('_', ' ')} - ৳{formData.priceMap[type] || 0}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {typeBerths.map(berth => (
                            <Card 
                              key={berth.id}
                              className={`cursor-pointer transition-all ${
                                formData.berthIds.includes(berth.id.toString()) 
                                  ? 'border-primary bg-primary/5' 
                                  : 'hover:border-gray-400'
                              }`}
                              onClick={() => handleBerthSelection(berth.id.toString())}
                            >
                              <CardContent className="p-3">
                                <div className="font-medium">Coach {berth.coachNumber}</div>
                                <div className="text-xs text-neutral">
                                  {berth.totalSeats} seats ({berth.seatsPerCoach} per coach)
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded-md">
                    <p className="text-neutral">No berths available for this train.</p>
                  </div>
                )}
              </div>
            </>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!selectedSchedule || formData.berthIds.length === 0 || manageBerthSchedule.isPending}
          >
            {manageBerthSchedule.isPending ? "Creating..." : `Schedule ${formData.berthIds.length} Berths`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 