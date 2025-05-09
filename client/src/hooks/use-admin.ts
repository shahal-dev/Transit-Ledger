import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useAdmin() {
  const { toast } = useToast();

  // Get all users
  const useAllUsers = () => {
    return useQuery({
      queryKey: ['/api/admin/users'],
      refetchOnWindowFocus: false,
    });
  };

  // Get all tickets
  const useAllTickets = () => {
    return useQuery({
      queryKey: ['/api/admin/tickets'],
      refetchOnWindowFocus: false,
    });
  };

  // Get all trains
  const useAllTrains = () => {
    return useQuery({
      queryKey: ['/api/admin/trains'],
      refetchOnWindowFocus: false,
    });
  };

  // Get all stations
  const useAllStations = () => {
    return useQuery({
      queryKey: ['/api/admin/stations'],
      refetchOnWindowFocus: false,
    });
  };

  // Get all seats
  const useAllSeats = () => {
    return useQuery({
      queryKey: ['/api/admin/seats'],
      refetchOnWindowFocus: false,
    });
  };

  // Get all schedules
  const useAllSchedules = () => {
    return useQuery({
      queryKey: ['/api/admin/schedules'],
      refetchOnWindowFocus: false,
    });
  };

  // Get dashboard stats
  const useDashboardStats = () => {
    return useQuery({
      queryKey: ['/api/admin/stats'],
      refetchOnWindowFocus: false,
    });
  };

  // Admin login
  const useAdminLogin = () => {
    return useMutation({
      mutationFn: async (data: { username: string; password: string }) => {
        try {
          // First, log out any existing user
          await apiRequest("POST", "/api/logout");
          
          // Then login with standard credentials (without isAdmin flag)
          const res = await apiRequest("POST", "/api/login", {
            username: data.username,
            password: data.password
          });
          
          const result = await res.json();
          
          // Check if the logged in user has admin privileges
          if (!result.isAdmin) {
            throw new Error("You don't have admin privileges");
          }
          
          return result;
        } catch (error) {
          console.error('Admin login error:', error);
          throw error;
        }
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["/api/user"], data);
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the admin dashboard",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Manage users
  const useManageUser = () => {
    return useMutation({
      mutationFn: async (data: { userId: number; action: string; updates?: any }) => {
        const res = await apiRequest("POST", `/api/admin/users/${data.userId}/${data.action}`, data.updates);
        return await res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Manage trains
  const useManageTrain = () => {
    return useMutation({
      mutationFn: async (data: { trainId?: number; action: string; updates?: any }) => {
        let url = '/api/admin/trains';
        let payload = data.updates || {};
        
        // Handle different actions
        if (data.action === 'create') {
          url = '/api/admin/trains/create';
        } else if (data.action === 'edit') {
          url = '/api/admin/trains/edit';
          payload = { ...payload, id: data.trainId };
        } else if (data.action === 'delete') {
          url = '/api/admin/trains/delete';
          payload = { id: data.trainId };
        } else if (data.action === 'activate') {
          url = '/api/admin/trains/activate';
          payload = { id: data.trainId };
        } else if (data.action === 'deactivate') {
          url = '/api/admin/trains/deactivate';
          payload = { id: data.trainId };
        } else {
          // Legacy action format
          url = `/api/admin/trains/${data.action}`;
          payload = { ...payload, id: data.trainId };
        }
        
        const res = await apiRequest("POST", url, payload);
        return await res.json();
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/trains'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
        
        // Customize message based on action
        let message = "Train updated successfully";
        if (variables.action === 'create') {
          message = "Train created successfully";
        } else if (variables.action === 'delete') {
          message = "Train deleted successfully";
        } else if (variables.action === 'activate') {
          message = "Train activated successfully";
        } else if (variables.action === 'deactivate') {
          message = "Train deactivated successfully";
        }
        
        toast({
          title: "Success",
          description: message,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Manage stations
  const useManageStation = () => {
    return useMutation({
      mutationFn: async (data: { stationId?: number; action: string; updates?: any }) => {
        let url = '/api/admin/stations';
        let payload = data.updates || {};
        
        // Handle different actions
        if (data.action === 'create') {
          url = '/api/admin/stations/create';
        } else if (data.action === 'edit') {
          url = '/api/admin/stations/edit';
          payload = { ...payload, id: data.stationId };
        } else if (data.action === 'delete') {
          url = '/api/admin/stations/delete';
          payload = { id: data.stationId };
        } else if (data.action === 'maintenance') {
          url = '/api/admin/stations/maintenance';
          payload = { id: data.stationId };
        } else if (data.action === 'activate') {
          url = '/api/admin/stations/activate';
          payload = { id: data.stationId };
        } else {
          // Legacy action format
          url = `/api/admin/stations/${data.action}`;
          payload = { ...payload, id: data.stationId };
        }
        
        const res = await apiRequest("POST", url, payload);
        return await res.json();
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stations'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
        
        // Customize message based on action
        let message = "Station updated successfully";
        if (variables.action === 'create') {
          message = "Station created successfully";
        } else if (variables.action === 'delete') {
          message = "Station deleted successfully";
        } else if (variables.action === 'maintenance') {
          message = "Station set to maintenance mode";
        } else if (variables.action === 'activate') {
          message = "Station set to operational";
        }
        
        toast({
          title: "Success",
          description: message,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Manage seats
  const useManageSeat = () => {
    return useMutation({
      mutationFn: async (data: { seatId?: number; action: string; updates?: any }) => {
        let payload = {
          action: data.action,
          seatId: data.seatId,
          updates: data.updates || {}
        };
        
        const res = await apiRequest("POST", "/api/admin/seats", payload);
        return await res.json();
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/seats'] });
        
        // Customize message based on action
        let message = "Seat updated successfully";
        if (variables.action === 'create') {
          message = "Seat created successfully";
        } else if (variables.action === 'delete') {
          message = "Seat deleted successfully";
        } else if (variables.action === 'activate') {
          message = "Seat activated successfully";
        } else if (variables.action === 'deactivate') {
          message = "Seat set to maintenance";
        }
        
        toast({
          title: "Success",
          description: message,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Manage schedules
  const useManageSchedule = () => {
    return useMutation({
      mutationFn: async (data: { scheduleId?: number; action: string; updates?: any }) => {
        const res = await apiRequest("POST", `/api/admin/schedules/${data.action}`, data.updates);
        return await res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
        toast({
          title: "Success",
          description: "Schedule updated successfully",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Manage tickets
  const useManageTicket = () => {
    return useMutation({
      mutationFn: async (data: { ticketId?: number; action: string; updates?: any }) => {
        // Only allow specific ticket actions - no creation
        if (!['confirm', 'cancel', 'delete'].includes(data.action)) {
          throw new Error("Action not permitted");
        }
        
        let url = `/api/admin/tickets/${data.action}`;
        let payload = { id: data.ticketId };
        
        const res = await apiRequest("POST", url, payload);
        return await res.json();
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
        
        // Message based on action
        let message = "Ticket updated successfully";
        if (variables.action === 'confirm') {
          message = "Ticket confirmed successfully";
        } else if (variables.action === 'cancel') {
          message = "Ticket cancelled successfully";
        } else if (variables.action === 'delete') {
          message = "Ticket deleted successfully";
        }
        
        toast({
          title: "Success",
          description: message,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Update ticket status
  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: number; status: string }) => {
      let url = `/api/admin/tickets/${ticketId}/${status}`;
      const res = await apiRequest("POST", url, {});
      return await res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      
      // Message based on action
      const message = variables.status === 'confirm' 
        ? "Ticket confirmed successfully"
        : "Ticket cancelled successfully";
      
      toast({
        title: "Success",
        description: message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper function to update ticket status
  const updateTicketStatus = (ticketId: number, status: string) => {
    updateTicketStatusMutation.mutate({ ticketId, status });
  };

  // Update schedule status
  const updateScheduleStatusMutation = useMutation({
    mutationFn: async ({ scheduleId, status }: { scheduleId: number; status: string }) => {
      const res = await apiRequest("POST", `/api/admin/schedules/${scheduleId}/update-status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/schedules'] });
      toast({
        title: "Success",
        description: "Schedule status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper function to update schedule status
  const updateScheduleStatus = (scheduleId: number, status: string) => {
    updateScheduleStatusMutation.mutate({ scheduleId, status });
  };

  return {
    useAllUsers,
    useAllTickets,
    useAllTrains,
    useAllStations,
    useAllSeats,
    useAllSchedules,
    useDashboardStats,
    useAdminLogin,
    useManageUser,
    useManageTrain,
    useManageStation,
    useManageSeat,
    useManageSchedule,
    useManageTicket,
    updateTicketStatus,
    updateScheduleStatus,
  };
} 