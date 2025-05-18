import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Admin login mutation
  const useAdminLogin = () => {
    return useMutation({
      mutationFn: async (credentials: { username: string; password: string }) => {
        const response = await apiRequest("POST", "/api/admin/login", credentials);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Admin login failed");
        }
        return response.json();
      },
      onSuccess: (user) => {
        queryClient.setQueryData(["/api/user"], user);
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.fullName}!`,
        });
        setLocation("/admin");
      },
      onError: (error: Error) => {
        toast({
          title: "Login failed",
          description: error.message || "Invalid admin credentials",
          variant: "destructive",
        });
      },
    });
  };

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
      mutationFn: async ({ seatId, action }: { seatId: number; action: string }) => {
        const response = await apiRequest("POST", `/api/admin/seats/${action}`, { id: seatId });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to manage seat");
        }
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Seat action completed successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'seats'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to perform seat action",
          variant: "destructive",
        });
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
      mutationFn: async ({ ticketId, action }: { ticketId: number; action: string }) => {
        const response = await apiRequest("POST", `/api/admin/tickets/${action}`, { id: ticketId });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to manage ticket");
        }
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Ticket action completed successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to perform ticket action",
          variant: "destructive",
        });
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

  // User management
  const useManageUser = () => {
    return useMutation({
      mutationFn: async ({ userId, action }: { userId: number; action: string }) => {
        const response = await apiRequest("POST", `/api/admin/users/${userId}/${action}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to manage user");
        }
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User action completed successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to perform user action",
          variant: "destructive",
        });
      }
    });
  };

  // Train management
  const useManageTrain = () => {
    return useMutation({
      mutationFn: async ({ trainId, action }: { trainId: number; action: string }) => {
        const response = await apiRequest("POST", `/api/admin/trains/${action}`, { id: trainId });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to manage train");
        }
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Train action completed successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'trains'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to perform train action",
          variant: "destructive",
        });
      }
    });
  };

  // Station management
  const useManageStation = () => {
    return useMutation({
      mutationFn: async ({ stationId, action }: { stationId: number; action: string }) => {
        const response = await apiRequest("POST", `/api/admin/stations/${action}`, { id: stationId });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to manage station");
        }
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Station action completed successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stations'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to perform station action",
          variant: "destructive",
        });
      }
    });
  };

  // Schedule management
  const useManageSchedule = () => {
    return useMutation({
      mutationFn: async ({ scheduleId, action }: { scheduleId: number; action: string }) => {
        const response = await apiRequest("POST", `/api/admin/schedules/${action}`, { id: scheduleId });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to manage schedule");
        }
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Schedule action completed successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to perform schedule action",
          variant: "destructive",
        });
      }
    });
  };

  // Berth schedule management
  const useAllBerthSchedules = () => {
    return useQuery({
      queryKey: ['admin', 'berth-schedules'],
      queryFn: async () => {
        const response = await apiRequest("GET", "/api/admin/berth-schedules");
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch berth schedules");
        }
        return response.json();
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
    useManageBerthSchedule,
    useAllBerthSchedules,
    useAdminLogin,
    useManageUser,
    useManageTrain,
    useManageStation,
    useManageSchedule
  };
} 