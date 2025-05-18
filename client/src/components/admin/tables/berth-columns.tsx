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
import { EditBerthForm } from "@/components/admin/EditBerthForm";

export type Berth = {
  id: number;
  trainId: number;
  train: {
    name: string;
    trainNumber: string;
  };
  type: string;
  coachNumber: number;
  seatsPerCoach: number;
  totalSeats: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<Berth>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "train.name",
    header: "Train",
    cell: ({ row }) => {
      const berth = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{berth.train?.name}</span>
          <span className="text-xs text-muted-foreground">{berth.train?.trainNumber}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Coach Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const displayType = type.replace('_', ' ');
      return (
        <Badge variant="outline">{displayType}</Badge>
      );
    },
  },
  {
    accessorKey: "coachNumber",
    header: "Coach Number",
  },
  {
    accessorKey: "seatsPerCoach",
    header: "Seats Per Coach",
  },
  {
    accessorKey: "totalSeats",
    header: "Total Seats",
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
      const berth = row.original;
      const { useManageBerth } = useAdmin();
      const manageBerth = useManageBerth();
      const [editOpen, setEditOpen] = useState(false);

      const handleEdit = () => {
        setEditOpen(true);
      };

      const handleStatusChange = async (status: string) => {
        try {
          await manageBerth.mutateAsync({
            action: 'update',
            data: {
              id: berth.id,
              status,
              type: berth.type,
              coachNumber: berth.coachNumber,
              seatsPerCoach: berth.seatsPerCoach,
              totalSeats: berth.totalSeats
            }
          });
        } catch (error) {
          console.error("Failed to update berth status:", error);
        }
      };

      const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this berth?")) {
          try {
            await manageBerth.mutateAsync({
              action: 'delete',
              data: {
                id: berth.id
              }
            });
          } catch (error) {
            console.error("Failed to delete berth:", error);
          }
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
              {berth.status === 'active' ? (
                <DropdownMenuItem onClick={() => handleStatusChange('inactive')}>
                  <Power className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                  <Power className="mr-2 h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Berth
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditBerthForm
            open={editOpen}
            onOpenChange={setEditOpen}
            berth={berth}
          />
        </>
      );
    },
  },
]; 