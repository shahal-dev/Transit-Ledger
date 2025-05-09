import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWallet } from "@/hooks/use-wallet";
import { useTickets } from "@/hooks/use-tickets";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { Ticket } from "@shared/types";

const paymentSchema = z.object({
  provider: z.string().min(1, "Payment provider is required"),
  phoneNumber: z.string().min(11, "Phone number must be at least 11 digits"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  ticket: Ticket;
  onPaymentComplete: () => void;
}

export default function PaymentForm({ ticket, onPaymentComplete }: PaymentFormProps) {
  const [step, setStep] = useState<"payment" | "processing" | "confirmation">("payment");
  const [transactionId, setTransactionId] = useState<string>("");
  const { useInitiatePayment, useVerifyPayment } = useWallet();
  const { useTicket } = useTickets();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const { data: ticketDetails, refetch } = useTicket(ticket.id);
  
  const initiatePaymentMutation = useInitiatePayment();
  const verifyPaymentMutation = useVerifyPayment();
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      provider: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      setStep("processing");
      
      const result = await initiatePaymentMutation.mutateAsync({
        provider: data.provider,
        phoneNumber: data.phoneNumber,
        ticketId: ticket.id
      });
      
      if (result.success) {
        setTransactionId(result.transactionId);
        
        // Automatically verify after a delay to simulate payment flow
        setTimeout(async () => {
          try {
            await verifyPaymentMutation.mutateAsync({
              provider: data.provider,
              transactionId: result.transactionId,
              ticketId: ticket.id
            });
            
            await refetch();
            setStep("confirmation");
            onPaymentComplete();
          } catch (error) {
            setStep("payment");
            toast({
              title: "Payment verification failed",
              description: "Please try again or use a different payment method",
              variant: "destructive",
            });
          }
        }, 3000);
      } else {
        setStep("payment");
        toast({
          title: "Payment failed",
          description: "Please try again or use a different payment method",
          variant: "destructive",
        });
      }
    } catch (error) {
      setStep("payment");
      toast({
        title: "Payment failed",
        description: "Please try again or use a different payment method",
        variant: "destructive",
      });
    }
  };
  
  const renderPaymentForm = () => {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="01XXXXXXXXX" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Payment Summary</h3>
            <div className="flex justify-between text-sm mb-1">
              <span>Ticket Price:</span>
              <span>৳150</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Service Fee:</span>
              <span>৳0</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t mt-2">
              <span>Total:</span>
              <span>৳150</span>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-secondary hover:bg-secondary-dark"
            disabled={initiatePaymentMutation.isPending}
          >
            {initiatePaymentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
        </form>
      </Form>
    );
  };
  
  const renderProcessing = () => {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-medium mb-2">Processing Payment</h3>
        <p className="text-neutral mb-4">Please wait while we verify your payment...</p>
        {transactionId && (
          <div className="bg-neutral-lightest p-3 rounded-md inline-block">
            <p className="text-sm text-neutral">Transaction ID:</p>
            <p className="font-mono text-sm">{transactionId}</p>
          </div>
        )}
      </div>
    );
  };
  
  const renderConfirmation = () => {
    return (
      <div className="text-center py-4">
        <div className="bg-success bg-opacity-10 text-success rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span className="material-icons text-3xl">check_circle</span>
        </div>
        <h3 className="text-xl font-medium mb-2">Payment Successful!</h3>
        <p className="text-neutral mb-6">Your ticket has been confirmed</p>
        
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 max-w-xs mx-auto">
          <div className="mb-4">
            <QRCodeSVG 
              value={ticketDetails?.qrCode || "TransitLedger Ticket"} 
              size={150}
              className="mx-auto"
            />
          </div>
          <p className="text-xs text-neutral mt-2">Scan this QR code at the station</p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate("/my-tickets")}
          >
            View My Tickets
          </Button>
          <Button 
            variant="default"
            className="bg-primary"
            onClick={() => navigate("/")}
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          {step === "payment" && "Please select your payment method"}
          {step === "processing" && "Processing your payment"}
          {step === "confirmation" && "Your payment has been confirmed"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "payment" && renderPaymentForm()}
        {step === "processing" && renderProcessing()}
        {step === "confirmation" && renderConfirmation()}
      </CardContent>
      {step === "payment" && (
        <CardFooter className="flex justify-center text-xs text-neutral border-t pt-4">
          <p>All transactions are secure and encrypted</p>
        </CardFooter>
      )}
    </Card>
  );
}
