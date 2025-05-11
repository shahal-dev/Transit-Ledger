import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all users
  const useAllUsers = () => {
    return useQuery({
      queryKey: ['admin', 'users'],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/admin/users");
        return response.json();
      }
    });
  };

  // Create a new user
  const useCreateUser = () => {
    return useMutation({
      mutationFn: async (userData: any) => {
        const response = await apiRequest("POST", "/api/admin/users/create", userData);
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create user",
          variant: "destructive",
        });
      }
    });
  };

  // Update a user
  const useUpdateUser = () => {
    return useMutation({
      mutationFn: async ({ id, userData }: { id: number, userData: any }) => {
        const response = await apiRequest("PUT", `/api/admin/users/${id}`, userData);
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update user",
          variant: "destructive",
        });
      }
    });
  };

  // Delete a user
  const useDeleteUser = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await apiRequest("DELETE", `/api/admin/users/${id}`);
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete user",
          variant: "destructive",
        });
      }
    });
  };

  // Train management
  const useCreateTrain = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", "/api/admin/trains", data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'trains'] });
      }
    });
  };

  const useUpdateTrain = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("PUT", `/api/admin/trains/${data.id}`, data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'trains'] });
      }
    });
  };

  const useDeleteTrain = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await apiRequest("POST", "/api/admin/trains/delete", { id });
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'trains'] });
      }
    });
  };

  const useAllTrains = () => {
    return useQuery({
      queryKey: ['admin', 'trains'],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/admin/trains");
        return response.json();
      }
    });
  };

  // Station management
  const useCreateStation = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", "/api/admin/stations", data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'stations'] });
      }
    });
  };

  const useUpdateStation = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("PUT", `/api/admin/stations/${data.id}`, data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'stations'] });
      }
    });
  };

  const useDeleteStation = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await apiRequest("DELETE", `/api/admin/stations/${id}`);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'stations'] });
      }
    });
  };

  const useAllStations = () => {
    return useQuery({
      queryKey: ['admin', 'stations'],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/admin/stations");
        return response.json();
      }
    });
  };

  // Schedule management
  const useCreateSchedule = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", "/api/admin/schedules", data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      }
    });
  };

  const useUpdateSchedule = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("PUT", `/api/admin/schedules/${data.id}`, data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      }
    });
  };

  const useDeleteSchedule = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await apiRequest("POST", "/api/admin/schedules/delete", { id });
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      }
    });
  };

  const useAllSchedules = () => {
    return useQuery({
      queryKey: ['admin', 'schedules'],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/admin/schedules");
        return response.json();
      }
    });
  };

  // Seat management
  const useManageSeat = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", "/api/admin/seats/manage", data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'seats'] });
      }
    });
  };

  const useAllSeats = () => {
    return useQuery({
      queryKey: ['admin', 'seats'],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/admin/seats");
        return response.json();
      }
    });
  };

  // Dashboard statistics
  const useDashboardStats = () => {
    return useQuery({
      queryKey: ['admin', 'stats'],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/admin/stats");
        return response.json();
      }
    });
  };

  // Seat Schedule management
  const useManageSeatSchedule = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", "/api/admin/seat-schedules/manage", data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      }
    });
  };

  // Ticket management
  const useManageTicket = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", "/api/admin/tickets/manage", data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      }
    });
  };

  const useAllTickets = () => {
    return useQuery({
      queryKey: ['admin', 'tickets'],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/admin/tickets");
        return response.json();
      }
    });
  };

  // Berth management
  const useManageBerth = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", "/api/admin/berths/manage", data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'berths'] });
      }
    });
  };
  
  // Get all berths
  const useAllBerths = () => {
    return useQuery({
      queryKey: ['admin', 'berths'],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/admin/berths");
        return response.json();
      }
    });
  };
  
  // Berth schedule management
  const useManageBerthSchedule = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("POST", "/api/admin/berth-schedules/manage", data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      }
    });
  };

  return {
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useAllUsers,
    useCreateTrain,
    useUpdateTrain,
    useDeleteTrain,
    useAllTrains,
    useCreateStation,
    useUpdateStation,
    useDeleteStation,
    useAllStations,
    useCreateSchedule,
    useUpdateSchedule,
    useDeleteSchedule,
    useAllSchedules,
    useManageSeat,
    useAllSeats,
    useDashboardStats,
    useManageSeatSchedule,
    useManageTicket,
    useAllTickets,
    useManageBerth,
    useAllBerths,
    useManageBerthSchedule
  };
} 