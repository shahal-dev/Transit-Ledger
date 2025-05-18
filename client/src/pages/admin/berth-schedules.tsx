import React from 'react';
import { Helmet } from 'react-helmet';
import { useAdmin } from '@/hooks/use-admin';
import { AdminLayout } from '@/components/admin/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from '@/components/admin/data-table';
import { CreateBerthScheduleForm } from '@/components/admin/CreateBerthScheduleForm';
import { columns } from '@/components/admin/tables/berth-schedule-columns';
import { useAuth } from '@/hooks/use-auth';

export default function BerthSchedulesPage() {
  const auth = useAuth();
  const { useAllBerthSchedules } = useAdmin();
  const { data: berthSchedules, isLoading, error } = useAllBerthSchedules();

  if (!auth.user?.isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <>
      <Helmet>
        <title>Berth Schedules | Admin Dashboard</title>
      </Helmet>
      
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Berth Schedules</h1>
            <div className="flex gap-2">
              <CreateBerthScheduleForm />
            </div>
          </div>
          
          <Tabs defaultValue="active" className="mb-6">
            <TabsList>
              <TabsTrigger value="active">Active Schedules</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Schedules</TabsTrigger>
              <TabsTrigger value="all">All Schedules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <DataTable 
                columns={columns} 
                data={berthSchedules?.filter((schedule: any) => schedule.status === 'active') || []} 
                isLoading={isLoading} 
                error={error} 
              />
            </TabsContent>
            
            <TabsContent value="inactive">
              <DataTable 
                columns={columns} 
                data={berthSchedules?.filter((schedule: any) => schedule.status !== 'active') || []} 
                isLoading={isLoading} 
                error={error} 
              />
            </TabsContent>
            
            <TabsContent value="all">
              <DataTable 
                columns={columns} 
                data={berthSchedules || []} 
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