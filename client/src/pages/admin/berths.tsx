import React from 'react';
import { Helmet } from 'react-helmet';
import { useAdmin } from '@/hooks/use-admin';
import { AdminLayout } from '@/components/admin/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from '@/components/admin/data-table';
import { CreateBerthForm } from '@/components/admin/CreateBerthForm';
import { CreateBerthScheduleForm } from '@/components/admin/CreateBerthScheduleForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, MoreHorizontal, Edit, Trash2, Power } from 'lucide-react';

export default function BerthsPage() {
  const auth = useAuth();
  const { useAllBerths, useManageBerth } = useAdmin();
  const { data: berths, isLoading, error } = useAllBerths();
  const manageBerth = useManageBerth();

  if (!auth.user?.isAdmin) {
    return <div>Access denied</div>;
  }

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "train.name",
      header: "Train",
      cell: ({ row }: any) => (
        <div>
          <div>{row.original.train.name}</div>
          <div className="text-xs text-gray-500">{row.original.train.trainNumber}</div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Coach Type",
      cell: ({ row }: any) => {
        const type = row.original.type;
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
      cell: ({ row }: any) => {
        const status = row.original.status;
        
        if (status === 'active') {
          return <Badge variant="success">Active</Badge>;
        } else {
          return <Badge variant="destructive">Inactive</Badge>;
        }
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const berth = row.original;
        
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>Berth Management | Admin Dashboard</title>
      </Helmet>
      
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Berth Management</h1>
            <div className="flex gap-2">
              <CreateBerthForm />
              <CreateBerthScheduleForm />
            </div>
          </div>
          
          <Tabs defaultValue="active" className="mb-6">
            <TabsList>
              <TabsTrigger value="active">Active Berths</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Berths</TabsTrigger>
              <TabsTrigger value="all">All Berths</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <DataTable 
                columns={columns} 
                data={berths?.filter((berth: any) => berth.status === 'active') || []} 
                isLoading={isLoading} 
                error={error} 
              />
            </TabsContent>
            
            <TabsContent value="inactive">
              <DataTable 
                columns={columns} 
                data={berths?.filter((berth: any) => berth.status !== 'active') || []} 
                isLoading={isLoading} 
                error={error} 
              />
            </TabsContent>
            
            <TabsContent value="all">
              <DataTable 
                columns={columns} 
                data={berths || []} 
                isLoading={isLoading} 
                error={error} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </>
  );
} 