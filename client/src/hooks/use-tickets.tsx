import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

// Types
export interface Ticket {
  id: number;
  userId: number;
  scheduleId: number;
  seatNumber: string;
  ticketHash: string;
  qrCode: string;
  status: string;
  price: number;
  issuedAt: string;
  paymentStatus: string;
  paymentId: string | null;
  seatScheduleId: number | null;
  berthScheduleId: number | null;
  schedule?: {
    id: number;
    departureTime: string;
    arrivalTime: string;
    journeyDate: string;
    fromStation: {
      id: number;
      name: string;
    };
    toStation: {
      id: number;
      name: string;
    };
    train: {
      id: number;
      name: string;
      trainNumber: string;
    };
  };
}

export interface BookTicketParams {
  scheduleId: number | string;
  seatNumber: string;
  seatScheduleId?: number | string;
  berthScheduleId?: number | string;
}

// Custom hooks for ticket operations
export function useUserTickets() {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data } = await axios.get<Ticket[]>("/api/tickets/my");
      return data;
    }
  });
}

export function useTicketDetails(ticketId: number | string | undefined) {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      if (!ticketId) return null;
      const { data } = await axios.get<Ticket>(`/api/tickets/${ticketId}`);
      return data;
    },
    enabled: !!ticketId
  });
}

export function useBookTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (params: BookTicketParams) => {
      const { data } = await axios.post<Ticket>("/api/tickets/book", params);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Ticket reserved",
        description: "Your ticket has been reserved. Please complete the payment.",
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  });
}

export function useCancelTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (ticketId: number) => {
      const { data } = await axios.post<Ticket>(`/api/tickets/${ticketId}/cancel`);
      return data;
    },
    onSuccess: (_, ticketId) => {
      toast({
        title: "Ticket cancelled",
        description: "Your ticket has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  });
}

export function useTickets() {
  const { toast } = useToast();

  // Get all schedules
  const useSchedules = (date?: string) => {
    const queryKey = date ? [`/api/schedules?date=${date}`] : ['/api/schedules'];
    
    return useQuery({
      queryKey,
      queryFn: async () => {
        const { data } = await axios.get(date ? `/api/schedules?date=${date}` : '/api/schedules');
        return data;
      },
      refetchOnWindowFocus: false,
    });
  };

  // Get all stations
  const useStations = () => {
    return useQuery({
      queryKey: ['/api/stations'],
      queryFn: async () => {
        const { data } = await axios.get('/api/stations');
        return data;
      },
      refetchOnWindowFocus: false,
    });
  };

  // Get schedule by ID
  const useSchedule = (id: number) => {
    return useQuery({
      queryKey: [`/api/schedules/${id}`],
      queryFn: async () => {
        if (!id) return null;
        const { data } = await axios.get(`/api/schedules/${id}`);
        return data;
      },
      enabled: !!id,
      refetchOnWindowFocus: false,
    });
  };

  // Verify a ticket
  const useVerifyTicket = () => {
    return useMutation({
      mutationFn: async (data: { ticketHash: string, nidHash?: string, location?: string }) => {
        const { data: responseData } = await axios.post("/api/tickets/verify", data);
        return responseData;
      },
      onSuccess: (data) => {
        toast({
          title: "Ticket verified",
          description: `Valid ticket for ${data.user.fullName}.`,
        });
      },
      onError: (error: any) => {
        toast({
          title: "Verification failed",
          description: error.response?.data?.message || error.message,
          variant: "destructive",
        });
      },
    });
  };

  return {
    useSchedules,
    useStations,
    useSchedule,
    useUserTickets,
    useTicketDetails,
    useBookTicket,
    useCancelTicket,
    useVerifyTicket,
  };
}
