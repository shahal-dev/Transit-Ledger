import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Power } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/hooks/use-admin";
import { EditStationForm } from "@/components/admin/EditStationForm";

export type Station = {
  id: number;
  name: string;
  city: string;
  status: string;
  platforms: number;
  activeTrains: number;
  nextDeparture: string | null;
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<Station>[] = [
  {
    accessorKey: "name",
    header: "Station Name",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "operational"
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
    accessorKey: "platforms",
    header: "Platforms",
  },
  {
    accessorKey: "activeTrains",
    header: "Active Trains",
  },
  {
    accessorKey: "nextDeparture",
    header: "Next Departure",
    cell: ({ row }) => {
      const nextDeparture = row.getValue("nextDeparture");
      if (!nextDeparture) return <span>No scheduled departures</span>;
      
      const date = new Date(nextDeparture as string);
      return <span>{date.toLocaleString()}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const station = row.original;
      const { useManageStation } = useAdmin();
      const manageMutation = useManageStation();
      const [editOpen, setEditOpen] = useState(false);

      const handleEdit = () => {
        setEditOpen(true);
      };

      const handleToggleStatus = () => {
        if (station.status === "operational") {
          manageMutation.mutate({
            stationId: station.id,
            action: "maintenance"
          });
        } else {
          manageMutation.mutate({
            stationId: station.id,
            action: "activate"
          });
        }
      };

      const handleDelete = () => {
        if (confirm("Are you sure you want to delete this station?")) {
          manageMutation.mutate({
            stationId: station.id,
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
                onClick={() => navigator.clipboard.writeText(station.id.toString())}
              >
                Copy station ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                <Power className="mr-2 h-4 w-4" />
                {station.status === "operational" ? "Set to Maintenance" : "Set to Operational"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Station
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <EditStationForm 
            open={editOpen}
            onOpenChange={setEditOpen}
            station={station}
          />
        </>
      );
    },
  },
]; 