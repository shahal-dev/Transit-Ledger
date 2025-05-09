import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useTickets() {
  const { toast } = useToast();

  // Get all schedules
  const useSchedules = (date?: string) => {
    const queryKey = date ? [`/api/schedules?date=${date}`] : ['/api/schedules'];
    
    return useQuery({
      queryKey,
      refetchOnWindowFocus: false,
    });
  };

  // Get all stations
  const useStations = () => {
    return useQuery({
      queryKey: ['/api/stations'],
      refetchOnWindowFocus: false,
    });
  };

  // Get schedule by ID
  const useSchedule = (id: number) => {
    return useQuery({
      queryKey: [`/api/schedules/${id}`],
      enabled: !!id,
      refetchOnWindowFocus: false,
    });
  };

  // Book a ticket
  const useBookTicket = () => {
    return useMutation({
      mutationFn: async (data: { scheduleId: number, seatNumber: string, seatScheduleId?: number }) => {
        const res = await apiRequest("POST", "/api/tickets/book", data);
        return await res.json();
      },
      onSuccess: () => {
        toast({
          title: "Ticket reserved",
          description: "Your ticket has been reserved. Please complete the payment.",
        });
        // Invalidate tickets query
        queryClient.invalidateQueries({ queryKey: ['/api/tickets/my'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Booking failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Get user tickets
  const useMyTickets = () => {
    return useQuery({
      queryKey: ['/api/tickets/my'],
      refetchOnWindowFocus: false,
    });
  };

  // Get ticket by ID
  const useTicket = (id: number) => {
    return useQuery({
      queryKey: [`/api/tickets/${id}`],
      enabled: !!id,
      refetchOnWindowFocus: false,
    });
  };

  // Cancel a ticket
  const useCancelTicket = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const res = await apiRequest("POST", `/api/tickets/${id}/cancel`);
        return await res.json();
      },
      onSuccess: () => {
        toast({
          title: "Ticket cancelled",
          description: "Your ticket has been cancelled successfully.",
        });
        // Invalidate tickets query
        queryClient.invalidateQueries({ queryKey: ['/api/tickets/my'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Cancellation failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Verify a ticket
  const useVerifyTicket = () => {
    return useMutation({
      mutationFn: async (data: { ticketHash: string, nidHash?: string, location?: string }) => {
        const res = await apiRequest("POST", "/api/tickets/verify", data);
        return await res.json();
      },
      onSuccess: (data) => {
        toast({
          title: "Ticket verified",
          description: `Valid ticket for ${data.user.fullName}.`,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return {
    useSchedules,
    useStations,
    useSchedule,
    useBookTicket,
    useMyTickets,
    useTicket,
    useCancelTicket,
    useVerifyTicket,
  };
}
