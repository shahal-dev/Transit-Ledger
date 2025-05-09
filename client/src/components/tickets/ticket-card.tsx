import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TicketCardProps {
  id: number;
  name: string;
  trainNumber: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  type: string;
  date: string;
  availableSeats: number;
  price: number;
}

export default function TicketCard({
  id,
  name,
  trainNumber,
  fromStation,
  toStation,
  departureTime,
  arrivalTime,
  duration,
  type,
  date,
  availableSeats,
  price = 150, // Fixed price per requirements
}: TicketCardProps) {
  // Status badge based on available seats
  const getBadgeVariant = () => {
    if (availableSeats > 50) return { variant: "success", text: "Available" };
    if (availableSeats > 20) return { variant: "warning", text: "Limited Seats" };
    return { variant: "error", text: "Almost Full" };
  };

  const badge = getBadgeVariant();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 relative ticket-card border border-neutral-light">
      <div className="md:flex">
        {/* Ticket Info */}
        <div className="p-6 md:w-3/4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-sm text-neutral mb-1">Train #{trainNumber}</p>
            </div>
            
            <div className={`bg-${badge.variant === "success" ? "success" : badge.variant === "warning" ? "warning" : "error"} bg-opacity-10 text-${badge.variant === "success" ? "success" : badge.variant === "warning" ? "warning" : "error"} text-xs px-3 py-1 rounded-full`}>
              {badge.text}
            </div>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4">
            <div>
              <p className="text-sm text-neutral">Departure</p>
              <p className="font-semibold">{fromStation}</p>
              <p className="text-lg font-mono">{departureTime}</p>
            </div>
            
            <div className="flex items-center px-2">
              <div className="w-full flex items-center">
                <div className="h-0.5 w-2 bg-neutral-light"></div>
                <div className="h-0.5 flex-grow bg-neutral-light border-dashed border-t border-neutral"></div>
                <span className="material-icons text-neutral mx-1">train</span>
                <div className="h-0.5 flex-grow bg-neutral-light border-dashed border-t border-neutral"></div>
                <div className="h-0.5 w-2 bg-neutral-light"></div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-neutral">Arrival</p>
              <p className="font-semibold">{toStation}</p>
              <p className="text-lg font-mono">{arrivalTime}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <span className="material-icons text-neutral text-sm mr-1">schedule</span>
              <span>{duration}</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-neutral text-sm mr-1">event_seat</span>
              <span>{type}</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-neutral text-sm mr-1">today</span>
              <span>{date}</span>
            </div>
          </div>
        </div>
        
        {/* Price and Book Button */}
        <div className="bg-neutral-lightest p-6 flex flex-col justify-between md:w-1/4">
          <div>
            <p className="text-sm text-neutral mb-1">Price per ticket</p>
            <p className="font-bold text-2xl">৳{price}</p>
            <p className="text-xs text-neutral mb-4">Including all taxes</p>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    asChild
                    className="bg-secondary hover:bg-secondary-dark text-white font-semibold px-4 py-2 rounded-md transition w-full"
                    disabled={availableSeats <= 0}
                  >
                    <Link href={`/tickets/${id}`}>
                      Book Now
                    </Link>
                  </Button>
                </div>
              </TooltipTrigger>
              {availableSeats <= 0 && (
                <TooltipContent>
                  <p>No seats available for this train</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
