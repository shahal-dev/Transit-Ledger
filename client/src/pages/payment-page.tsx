import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTickets } from "@/hooks/use-tickets";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import PaymentForm from "@/components/payment/payment-form";

interface PaymentPageProps {
  params: {
    id: string;
  }
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { useTicket } = useTickets();
  const ticketId = parseInt(params.id);
  const { data: ticket, isLoading, error } = useTicket(ticketId);
  
  useEffect(() => {
    if (ticket) {
      // Redirect if ticket is already paid
      if (ticket.paymentStatus === "completed") {
        navigate("/my-tickets");
        return;
      }
      
      // Redirect if ticket doesn't belong to the user
      if (ticket.userId !== user?.id) {
        navigate("/tickets");
        return;
      }
    }
  }, [ticket, user, navigate]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Payment | TransitLedger</title>
          <meta name="description" content="Complete your ticket payment" />
        </Helmet>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading payment details...</span>
        </div>
      </div>
    );
  }
  
  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Payment | TransitLedger</title>
          <meta name="description" content="Complete your ticket payment" />
        </Helmet>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>
              Failed to load ticket details. The ticket may not exist or has been cancelled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={() => navigate("/tickets")}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Return to Ticket Search
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Payment | TransitLedger</title>
        <meta name="description" content="Complete your ticket payment" />
      </Helmet>
      
      <PaymentForm 
        ticket={ticket} 
        onPaymentComplete={() => navigate("/my-tickets")} 
      />
    </div>
  );
}
