import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CoachLayoutProps {
  coachType: string;
  coachNumber: number;
  bookedSeats: string[];
  onSeatSelect: (seatNumber: string) => void;
  selectedSeat: string | null;
}

export default function CoachLayout({ 
  coachType, 
  coachNumber, 
  bookedSeats, 
  onSeatSelect,
  selectedSeat
}: CoachLayoutProps) {
  // Get a display name for the coach type
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
  
  // Generate the seat grid for a 4x20 coach
  const generateSeats = () => {
    const rows = 20;
    const cols = 4;
    const seatMap = [];
    
    for (let row = 1; row <= rows; row++) {
      const currentRow = [];
      
      for (let col = 1; col <= cols; col++) {
        // Create letter-number format (e.g., A1, B2)
        const column = ['A', 'B', 'C', 'D'][col - 1];
        const seatNumber = `${column}${row}`;
        
        const isBooked = bookedSeats.includes(seatNumber);
        const isSelected = selectedSeat === seatNumber;
        
        currentRow.push({
          seatNumber,
          isBooked,
          isSelected
        });
      }
      
      seatMap.push(currentRow);
    }
    
    return seatMap;
  };
  
  const seats = generateSeats();
  
  return (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium">Coach {coachNumber}</h3>
          <Badge variant="outline">{getCoachTypeDisplay(coachType)}</Badge>
        </div>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm mr-1"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 border border-gray-400 rounded-sm mr-1"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary/20 border border-primary rounded-sm mr-1"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="flex justify-center mb-2">
            <div className="w-1/2 h-8 bg-gray-100 rounded-md flex items-center justify-center text-sm font-medium">
              Coach entrance
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-1">
            {seats.flat().map((seat) => (
              <div
                key={seat.seatNumber}
                className={cn(
                  "aspect-square border h-10 flex items-center justify-center rounded-sm cursor-pointer transition-all text-sm",
                  seat.isBooked 
                    ? "bg-gray-200 border-gray-400 cursor-not-allowed" 
                    : seat.isSelected
                      ? "bg-primary/20 border-primary" 
                      : "bg-green-100 border-green-300 hover:border-green-500"
                )}
                onClick={() => !seat.isBooked && onSeatSelect(seat.seatNumber)}
              >
                {seat.seatNumber}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 