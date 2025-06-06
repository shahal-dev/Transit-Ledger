import React from 'react';
import { Helmet } from 'react-helmet';
import { useAdmin } from '@/hooks/use-admin';
import { AdminLayout } from '@/components/admin/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from '@/components/admin/data-table';
import { CreateBerthForm } from '@/components/admin/CreateBerthForm';
import { CreateBerthScheduleForm } from '@/components/admin/CreateBerthScheduleForm';
import { columns } from '@/components/admin/tables/berth-columns';
import { useAuth } from '@/hooks/use-auth';

export default function BerthsPage() {
  const auth = useAuth();
  const { useAllBerths } = useAdmin();
  const { data: berths, isLoading, error } = useAllBerths();

  if (!auth.user?.isAdmin) {
    return <div>Access denied</div>;
  }

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