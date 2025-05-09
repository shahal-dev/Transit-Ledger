import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useWallet() {
  const { toast } = useToast();

  // Get wallet details and transactions
  const useWalletDetails = () => {
    return useQuery({
      queryKey: ['/api/wallet'],
      refetchOnWindowFocus: false,
    });
  };

  // Add funds to wallet
  const useAddFunds = () => {
    return useMutation({
      mutationFn: async (data: { provider: string; phoneNumber: string; amount: number }) => {
        const res = await apiRequest("POST", "/api/wallet/add-funds", data);
        return await res.json();
      },
      onSuccess: (data) => {
        toast({
          title: "Funds added",
          description: `Successfully added ৳${data.transaction.amount} to your wallet.`,
        });
        // Invalidate wallet query
        queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Transaction failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Initiate payment for a ticket
  const useInitiatePayment = () => {
    return useMutation({
      mutationFn: async (data: { provider: string; phoneNumber: string; ticketId: number }) => {
        const res = await apiRequest("POST", "/api/payment/init", data);
        return await res.json();
      },
      onSuccess: (data) => {
        toast({
          title: "Payment initiated",
          description: `Transaction ID: ${data.transactionId}. Please verify the payment.`,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Payment initiation failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Verify payment for a ticket
  const useVerifyPayment = () => {
    return useMutation({
      mutationFn: async (data: { 
        provider: string; 
        transactionId: string; 
        ticketId: number 
      }) => {
        const res = await apiRequest("POST", "/api/payment/verify", data);
        return await res.json();
      },
      onSuccess: () => {
        toast({
          title: "Payment verified",
          description: "Your ticket has been confirmed.",
        });
        // Invalidate tickets query
        queryClient.invalidateQueries({ queryKey: ['/api/tickets/my'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Payment verification failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return {
    useWalletDetails,
    useAddFunds,
    useInitiatePayment,
    useVerifyPayment,
  };
}
