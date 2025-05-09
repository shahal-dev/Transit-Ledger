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
import { EditSeatForm } from "@/components/admin/EditSeatForm";

export type Seat = {
  id: number;
  trainId: number;
  train: {
    name: string;
    trainNumber: string;
  };
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
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<Seat>[] = [
  {
    accessorKey: "seatNumber",
    header: "Seat Number",
  },
  {
    id: "trainInfo",
    header: "Train",
    cell: ({ row }) => {
      const seat = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{seat.train?.name}</span>
          <span className="text-xs text-muted-foreground">{seat.train?.trainNumber}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "carNumber",
    header: "Car Number",
  },
  {
    accessorKey: "seatClass",
    header: "Class",
    cell: ({ row }) => {
      const seatClass = row.getValue("seatClass") as string;
      return (
        <Badge
          variant={
            seatClass === "first-class"
              ? "default"
              : seatClass === "business"
              ? "secondary"
              : "outline"
          }
        >
          {seatClass.charAt(0).toUpperCase() + seatClass.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    id: "features",
    header: "Features",
    cell: ({ row }) => {
      const seat = row.original;
      const features = seat.features || {};
      return (
        <div className="flex gap-1 flex-wrap">
          {features.hasAC && <Badge variant="outline">AC</Badge>}
          {features.hasPower && <Badge variant="outline">Power</Badge>}
          {features.hasWifi && <Badge variant="outline">WiFi</Badge>}
          {features.isReclining && <Badge variant="outline">Reclining</Badge>}
          {features.hasFootrest && <Badge variant="outline">Footrest</Badge>}
        </div>
      );
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
      const seat = row.original;
      const { useManageSeat } = useAdmin();
      const manageSeat = useManageSeat();
      const [editOpen, setEditOpen] = useState(false);

      const handleEdit = () => {
        setEditOpen(true);
      };

      const handleToggleStatus = () => {
        if (seat.status === "active") {
          manageSeat.mutate({
            seatId: seat.id,
            action: "deactivate"
          });
        } else {
          manageSeat.mutate({
            seatId: seat.id,
            action: "activate"
          });
        }
      };

      const handleDelete = () => {
        if (confirm("Are you sure you want to delete this seat?")) {
          manageSeat.mutate({
            seatId: seat.id,
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                <Power className="mr-2 h-4 w-4" />
                {seat.status === "active" ? "Set to Maintenance" : "Set to Active"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Seat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <EditSeatForm 
            open={editOpen}
            onOpenChange={setEditOpen}
            seat={seat}
          />
        </>
      );
    },
  },
]; 