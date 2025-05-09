import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

interface VerificationResultProps {
  result: {
    success: boolean;
    ticket: {
      id: number;
      userId: number;
      seatNumber: string;
      status: string;
      qrCode: string;
      price: number;
    };
    user: {
      fullName: string;
      nidHash: string;
    };
    schedule: {
      journeyDate: string;
      trainId: number;
    };
    train: {
      name: string;
      trainNumber: string;
      fromStation: string;
      toStation: string;
      departureTime: string;
      arrivalTime: string;
      type: string;
    };
  };
  onReset: () => void;
}

export default function TicketValidator({ result, onReset }: VerificationResultProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className={`${result.success ? 'bg-success bg-opacity-10' : 'bg-destructive bg-opacity-10'}`}>
        <div className="flex items-center">
          <span className={`material-icons mr-2 ${result.success ? 'text-success' : 'text-destructive'}`}>
            {result.success ? 'check_circle' : 'error'}
          </span>
          <CardTitle className={result.success ? 'text-success' : 'text-destructive'}>
            {result.success ? 'Valid Ticket' : 'Invalid Ticket'}
          </CardTitle>
        </div>
        <CardDescription>
          {result.success 
            ? 'Ticket verification successful' 
            : 'This ticket is invalid or has already been used'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {result.success && (
          <>
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <QRCodeSVG 
                  value={result.ticket.qrCode} 
                  size={120}
                />
              </div>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2">{result.train.name}</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-neutral">Train Number:</div>
                <div className="font-medium">{result.train.trainNumber}</div>
                
                <div className="text-neutral">Journey Date:</div>
                <div className="font-medium">{formatDate(result.schedule.journeyDate)}</div>
                
                <div className="text-neutral">Seat Number:</div>
                <div className="font-medium">{result.ticket.seatNumber}</div>
                
                <div className="text-neutral">Class:</div>
                <div className="font-medium">{result.train.type}</div>
              </div>
            </div>
            
            <div className="border-b pb-4">
              <div className="flex items-center mb-2">
                <span className="material-icons text-neutral mr-2">person</span>
                <h3 className="font-semibold">Passenger Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-neutral">Name:</div>
                <div className="font-medium">{result.user.fullName}</div>
                
                <div className="text-neutral">NID Hash:</div>
                <div className="font-mono text-xs truncate" title={result.user.nidHash}>
                  {result.user.nidHash.substring(0, 8)}...{result.user.nidHash.substring(result.user.nidHash.length - 8)}
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-2">
                <span className="material-icons text-neutral mr-2">train</span>
                <h3 className="font-semibold">Journey Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-neutral">From:</div>
                <div className="font-medium">{result.train.fromStation}</div>
                
                <div className="text-neutral">To:</div>
                <div className="font-medium">{result.train.toStation}</div>
                
                <div className="text-neutral">Departure:</div>
                <div className="font-medium">{result.train.departureTime}</div>
                
                <div className="text-neutral">Arrival:</div>
                <div className="font-medium">{result.train.arrivalTime}</div>
              </div>
            </div>
          </>
        )}
        
        {!result.success && (
          <div className="text-center py-8">
            <span className="material-icons text-destructive text-5xl mb-4">error_outline</span>
            <h3 className="text-lg font-semibold mb-2">Verification Failed</h3>
            <p className="text-neutral mb-4">This ticket is invalid or has already been used.</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <Button 
          onClick={onReset} 
          className="w-full"
          variant={result.success ? "outline" : "default"}
        >
          Verify Another Ticket
        </Button>
      </CardFooter>
    </Card>
  );
}
