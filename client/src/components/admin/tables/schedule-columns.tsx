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
import { EditScheduleForm } from "@/components/admin/EditScheduleForm";
import { format, formatDistance } from "date-fns";

export type Schedule = {
  id: number;
  trainId: number;
  fromStationId: number;
  toStationId: number;
  departureTime: string;
  arrivalTime: string;
  journeyDate: string;
  availableSeats: number;
  status: "scheduled" | "delayed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
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
  seatSchedules?: any[];
  tickets?: any[];
};

export const columns: ColumnDef<Schedule>[] = [
  {
    id: "trainName",
    header: "Train",
    accessorFn: (row) => row.train?.name || "Unknown",
    cell: ({ row }) => {
      const schedule = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{schedule.train?.name || "Unknown"}</span>
          <span className="text-xs text-muted-foreground">{schedule.train?.trainNumber}</span>
        </div>
      );
    }
  },
  {
    id: "fromStation",
    header: "From Station",
    accessorFn: (row) => row.fromStation?.name || "Unknown",
    cell: ({ row }) => {
      const schedule = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{schedule.fromStation?.name || "Unknown"}</span>
          <span className="text-xs text-muted-foreground">{schedule.fromStation?.city}</span>
        </div>
      );
    }
  },
  {
    id: "toStation",
    header: "To Station",
    accessorFn: (row) => row.toStation?.name || "Unknown",
    cell: ({ row }) => {
      const schedule = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{schedule.toStation?.name || "Unknown"}</span>
          <span className="text-xs text-muted-foreground">{schedule.toStation?.city}</span>
        </div>
      );
    }
  },
  {
    id: "departure",
    header: "Departure",
    cell: ({ row }) => {
      const schedule = row.original;
      const departureTime = new Date(schedule.departureTime);
      return (
        <div className="flex flex-col">
          <span>{format(departureTime, "PPP")}</span>
          <span className="text-xs text-muted-foreground">{format(departureTime, "p")}</span>
        </div>
      );
    }
  },
  {
    id: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const schedule = row.original;
      const departureTime = new Date(schedule.departureTime);
      const arrivalTime = new Date(schedule.arrivalTime);
      
      // Calculate duration
      const duration = formatDistance(arrivalTime, departureTime, { addSuffix: false });
      
      return <span>{duration}</span>;
    }
  },
  {
    accessorKey: "availableSeats",
    header: "Available Seats",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "scheduled"
              ? "default"
              : status === "delayed"
              ? "warning"
              : status === "cancelled"
              ? "destructive"
              : "success"
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
      const schedule = row.original;
      const { useManageSchedule } = useAdmin();
      const manageSchedule = useManageSchedule();
      const [editOpen, setEditOpen] = useState(false);

      const handleEdit = () => {
        setEditOpen(true);
      };

      const handleDelete = () => {
        if (confirm("Are you sure you want to delete this schedule?")) {
          manageSchedule.mutate({
            scheduleId: schedule.id,
            action: "delete"
          });
        }
      };

      return (
        <>
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
                onClick={() => navigator.clipboard.writeText(schedule.id.toString())}
              >
                Copy schedule ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit details
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete schedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditScheduleForm 
            open={editOpen}
            onOpenChange={setEditOpen}
            schedule={schedule}
          />
        </>
      );
    },
  },
]; 