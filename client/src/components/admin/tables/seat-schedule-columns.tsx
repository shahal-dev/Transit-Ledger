import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/hooks/use-admin";
import { format } from "date-fns";

export type SeatSchedule = {
  id: number;
  scheduleId: number;
  seatId: number;
  price: number;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
  schedule?: {
    id: number;
    trainId: number;
    fromStationId: number;
    toStationId: number;
    departureTime: string;
    arrivalTime: string;
    journeyDate: string;
    train?: {
      id: number;
      name: string;
      trainNumber: string;
    };
    fromStation?: {
      id: number;
      name: string;
      city: string;
    };
    toStation?: {
      id: number;
      name: string;
      city: string;
    };
  };
  seat?: {
    id: number;
    trainId: number;
    seatNumber: string;
    seatClass: string;
    carNumber: number;
    position: string;
    features: {
      hasAC?: boolean;
      hasPower?: boolean;
      hasWifi?: boolean;
      isReclining?: boolean;
      hasFootrest?: boolean;
    };
    status: string;
  };
};

export const columns: ColumnDef<SeatSchedule>[] = [
  {
    id: "journey",
    header: "Journey",
    cell: ({ row }) => {
      const seatSchedule = row.original;
      const schedule = seatSchedule.schedule;
      
      if (!schedule) return <span>Unknown Journey</span>;
      
      const trainName = schedule.train?.name || "Unknown Train";
      const fromStation = schedule.fromStation?.name || "Unknown From";
      const toStation = schedule.toStation?.name || "Unknown To";
      
      return (
        <div className="flex flex-col">
          <span className="font-medium">{trainName}</span>
          <span className="text-xs text-muted-foreground">
            {fromStation} → {toStation}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(schedule.departureTime), "PPP")}
          </span>
        </div>
      );
    }
  },
  {
    id: "seat",
    header: "Seat",
    cell: ({ row }) => {
      const seatSchedule = row.original;
      const seat = seatSchedule.seat;
      
      if (!seat) return <span>Unknown Seat</span>;
      
      return (
        <div className="flex flex-col">
          <span className="font-medium">{seat.seatNumber}</span>
          <span className="text-xs text-muted-foreground">
            Car {seat.carNumber}, {seat.position} seat
          </span>
          <Badge variant="outline" className="mt-1 w-fit">
            {seat.seatClass.charAt(0).toUpperCase() + seat.seatClass.slice(1)}
          </Badge>
        </div>
      );
    }
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      
      return <span>{formatted}</span>;
    }
  },
  {
    accessorKey: "isBooked",
    header: "Status",
    cell: ({ row }) => {
      const isBooked = row.getValue("isBooked");
      return (
        <Badge variant={isBooked ? "destructive" : "success"}>
          {isBooked ? "Booked" : "Available"}
        </Badge>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const seatSchedule = row.original;
      const { useManageSeatSchedule } = useAdmin();
      const manageSeatSchedule = useManageSeatSchedule();
      
      const handleUpdatePrice = () => {
        const newPrice = prompt("Enter the new price:", seatSchedule.price.toString());
        if (newPrice === null) return;
        
        const price = parseFloat(newPrice);
        if (isNaN(price) || price < 0) {
          alert("Please enter a valid price");
          return;
        }
        
        manageSeatSchedule.mutate({
          action: "update",
          updates: {
            id: seatSchedule.id,
            price
          }
        });
      };
      
      const toggleBookingStatus = () => {
        manageSeatSchedule.mutate({
          action: seatSchedule.isBooked ? "cancel" : "book",
          updates: {
            id: seatSchedule.id
          }
        });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleUpdatePrice}>
              <Edit className="mr-2 h-4 w-4" />
              Update Price
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleBookingStatus}>
              <CreditCard className="mr-2 h-4 w-4" />
              {seatSchedule.isBooked ? "Cancel Booking" : "Mark as Booked"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 