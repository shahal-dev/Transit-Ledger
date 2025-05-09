import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Ban, CheckCircle, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/hooks/use-admin";

export type Ticket = {
  id: number;
  ticketHash: string;
  userId: number;
  scheduleId: number;
  seatNumber: string;
  paymentId: string | null;
  paymentStatus: string;
  qrCode: string;
  price: number;
  issuedAt: string;
  status: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  schedule: {
    id: number;
    train: {
      id: number;
      name: string;
      trainNumber: string;
      fromStation: string;
      toStation: string;
    };
    journeyDate: string;
  };
};

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "ticketHash",
    header: "Ticket ID",
    cell: ({ row }) => {
      const hash = row.getValue("ticketHash") as string;
      return <span className="font-mono">{hash.slice(0, 8)}...</span>;
    },
  },
  {
    accessorKey: "user.fullName",
    header: "Passenger",
  },
  {
    id: "train",
    header: "Train",
    cell: ({ row }) => {
      const ticket = row.original;
      return <span>{ticket.schedule.train.name}</span>;
    }
  },
  {
    id: "route",
    header: "Route",
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <span>{ticket.schedule.train.fromStation} → {ticket.schedule.train.toStation}</span>
      );
    }
  },
  {
    accessorKey: "schedule.journeyDate",
    header: "Journey Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("schedule.journeyDate"));
      return <span>{date.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: "seatNumber",
    header: "Seat",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "booked"
              ? "default"
              : status === "confirmed"
              ? "success"
              : status === "cancelled"
              ? "destructive"
              : "secondary"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      return (
        <Badge
          variant={
            status === "completed"
              ? "success"
              : status === "pending"
              ? "warning"
              : status === "failed"
              ? "destructive"
              : "secondary"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return <span>৳{price}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ticket = row.original;
      const { useManageTicket } = useAdmin();
      const manageTicket = useManageTicket();

      const handleConfirmTicket = () => {
        manageTicket.mutate({
          ticketId: ticket.id,
          action: "confirm"
        });
      };

      const handleCancelTicket = () => {
        if (confirm("Are you sure you want to cancel this ticket?")) {
          manageTicket.mutate({
            ticketId: ticket.id,
            action: "cancel"
          });
        }
      };

      const handleDeleteTicket = () => {
        if (confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
          manageTicket.mutate({
            ticketId: ticket.id,
            action: "delete"
          });
        }
      };

      // Determine which actions to show based on current status
      const canConfirm = ticket.status === "booked";
      const canCancel = ticket.status !== "cancelled" && ticket.status !== "used";

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(ticket.id.toString())}
            >
              Copy ticket ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canConfirm && (
              <DropdownMenuItem onClick={handleConfirmTicket}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Ticket
              </DropdownMenuItem>
            )}
            {canCancel && (
              <DropdownMenuItem
                className="text-amber-600"
                onClick={handleCancelTicket}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel Ticket
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleDeleteTicket}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Ticket
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 