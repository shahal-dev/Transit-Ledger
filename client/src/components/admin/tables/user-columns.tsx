import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Ban, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/hooks/use-admin";

export type User = {
  id: number;
  email: string;
  username: string;
  fullName: string;
  verified: boolean;
  isAdmin: boolean;
  createdAt: string;
  wallet?: {
    id: number;
    balance: number;
  };
  _count?: {
    tickets: number;
  };
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "verified",
    header: "Status",
    cell: ({ row }) => {
      const verified = row.getValue("verified");
      const isAdmin = row.original.isAdmin;

      return (
        <div className="flex gap-2">
          {verified ? (
            <Badge variant="success">Verified</Badge>
          ) : (
            <Badge variant="secondary">Unverified</Badge>
          )}
          {isAdmin && (
            <Badge variant="default" className="bg-primary">Admin</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") 
        ? new Date(row.getValue("createdAt"))
        : new Date();
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const { useManageUser } = useAdmin();
      const manageMutation = useManageUser();

      const handleAction = async (action: string) => {
        await manageMutation.mutateAsync({
          userId: user.id,
          action,
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
            <DropdownMenuSeparator />
            {!user.verified && (
              <DropdownMenuItem onClick={() => handleAction("verify")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify User
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleAction("resetPassword")}>
              <Ban className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 