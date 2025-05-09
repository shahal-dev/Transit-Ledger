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
import { EditTrainForm } from "@/components/admin/EditTrainForm";

export type Train = {
  id: number;
  name: string;
  trainNumber: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  seats?: any[];
  schedules?: any[];
};

export const columns: ColumnDef<Train>[] = [
  {
    accessorKey: "name",
    header: "Train Name",
  },
  {
    accessorKey: "trainNumber",
    header: "Train Number",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    id: "schedules",
    header: "Routes",
    cell: ({ row }) => {
      const train = row.original;
      const scheduleCount = train.schedules?.length || 0;
      return (
        <Badge variant="outline">
          {scheduleCount} {scheduleCount === 1 ? "route" : "routes"}
        </Badge>
      );
    }
  },
  {
    id: "seats",
    header: "Seats",
    cell: ({ row }) => {
      const train = row.original;
      const seatCount = train.seats?.length || 0;
      return (
        <Badge variant="outline">
          {seatCount} {seatCount === 1 ? "seat" : "seats"}
        </Badge>
      );
    }
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
      const train = row.original;
      const { useManageTrain } = useAdmin();
      const manageMutation = useManageTrain();
      const [editOpen, setEditOpen] = useState(false);

      const handleEdit = () => {
        setEditOpen(true);
      };

      const handleToggleStatus = () => {
        if (train.status === "active") {
          manageMutation.mutate({
            trainId: train.id,
            action: "deactivate"
          });
        } else {
          manageMutation.mutate({
            trainId: train.id,
            action: "activate"
          });
        }
      };

      const handleDelete = () => {
        if (confirm("Are you sure you want to delete this train?")) {
          manageMutation.mutate({
            trainId: train.id,
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
                {train.status === "active" ? "Deactivate" : "Activate"} Train
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Train
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <EditTrainForm 
            open={editOpen}
            onOpenChange={setEditOpen}
            train={train}
          />
        </>
      );
    },
  },
]; 