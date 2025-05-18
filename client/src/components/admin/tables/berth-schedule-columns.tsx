import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
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

export type BerthSchedule = {
  id: number;
  scheduleId: number;
  berthId: number;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  schedule: {
    id: number;
    train: {
      name: string;
      trainNumber: string;
    };
    fromStation: {
      name: string;
      city: string;
    };
    toStation: {
      name: string;
      city: string;
    };
    journeyDate: string;
    departureTime: string;
    arrivalTime: string;
  };
  berth: {
    id: number;
    type: string;
    coachNumber: number;
    seatsPerCoach: number;
    totalSeats: number;
  };
};

export const columns: ColumnDef<BerthSchedule>[] = [
  {
    accessorKey: "schedule.train.name",
    header: "Train",
    cell: ({ row }) => {
      const schedule = row.original.schedule;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{schedule.train.name}</span>
          <span className="text-xs text-muted-foreground">{schedule.train.trainNumber}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "schedule.fromStation.name",
    header: "From Station",
    cell: ({ row }) => {
      const schedule = row.original.schedule;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{schedule.fromStation.name}</span>
          <span className="text-xs text-muted-foreground">{schedule.fromStation.city}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "schedule.toStation.name",
    header: "To Station",
    cell: ({ row }) => {
      const schedule = row.original.schedule;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{schedule.toStation.name}</span>
          <span className="text-xs text-muted-foreground">{schedule.toStation.city}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "schedule.journeyDate",
    header: "Journey Date",
    cell: ({ row }) => {
      const date = new Date(row.original.schedule.journeyDate);
      return <span>{format(date, "PPP")}</span>;
    },
  },
  {
    accessorKey: "berth.type",
    header: "Coach Type",
    cell: ({ row }) => {
      const type = row.original.berth.type;
      const displayType = type.replace('_', ' ');
      return (
        <Badge variant="outline">{displayType}</Badge>
      );
    },
  },
  {
    accessorKey: "berth.coachNumber",
    header: "Coach Number",
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "active"
              ? "success"
              : status === "maintenance"
              ? "warning"
              : "destructive"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const berthSchedule = row.original;
      const { useManageBerthSchedule } = useAdmin();
      const manageBerthSchedule = useManageBerthSchedule();

      const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this berth schedule?")) {
          try {
            await manageBerthSchedule.mutateAsync({
              action: 'delete',
              data: {
                id: berthSchedule.id
              }
            });
          } catch (error) {
            console.error("Failed to delete berth schedule:", error);
          }
        }
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Schedule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 