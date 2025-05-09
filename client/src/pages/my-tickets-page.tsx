import { useState } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLocation, Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ticket } from "@shared/types";

export default function MyTicketsPage() {
  const { useMyTickets, useCancelTicket } = useTickets();
  const [, navigate] = useLocation();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  const { data: tickets = [], isLoading, error } = useMyTickets();
  const cancelTicketMutation = useCancelTicket();
  
  const handleCancelTicket = async (ticketId: number) => {
    try {
      await cancelTicketMutation.mutateAsync(ticketId);
    } catch (error) {
      console.error("Failed to cancel ticket:", error);
    }
  };
  
  // Filter tickets by status
  const upcomingTickets = tickets.filter((ticket: Ticket) =>
    ticket.paymentStatus === "completed" && new Date(ticket.schedule.journeyDate) > new Date()
  );
  
  const pastTickets = tickets.filter((ticket: Ticket) =>
    ticket.paymentStatus === "completed" && new Date(ticket.schedule.journeyDate) <= new Date()
  );
  
  const cancelledTickets = tickets.filter((ticket: Ticket) =>
    ticket.paymentStatus === "cancelled"
  );
  
  // Helper function to get seat class name
  const getSeatClassName = (ticket: any) => {
    if (ticket.seatSchedule?.seat) {
      const seatClass = ticket.seatSchedule.seat.seatClass;
      return seatClass.charAt(0).toUpperCase() + seatClass.slice(1);
    }
    
    if (ticket.metadata?.seatClass) {
      const seatClass = ticket.metadata.seatClass;
      return seatClass.charAt(0).toUpperCase() + seatClass.slice(1);
    }
    
    return "Standard";
  };
  
  // Helper function to render ticket status badge
  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === "cancelled") {
      return <span className="px-2 py-1 text-xs rounded-full bg-destructive bg-opacity-10 text-destructive">Cancelled</span>;
    }
    
    if (status === "used") {
      return <span className="px-2 py-1 text-xs rounded-full bg-neutral bg-opacity-10 text-neutral-dark">Used</span>;
    }
    
    if (paymentStatus === "pending") {
      return <span className="px-2 py-1 text-xs rounded-full bg-warning bg-opacity-10 text-warning">Payment Pending</span>;
    }
    
    return <span className="px-2 py-1 text-xs rounded-full bg-success bg-opacity-10 text-success">Confirmed</span>;
  };
  
  // Helper function to format station name
  const formatStationName = (station: any) => {
    if (!station) return "Unknown";
    if (typeof station === 'string') return station;
    return `${station.name}, ${station.city}`;
  };
  
  // Helper function to format time from datetime
  const formatTime = (datetimeStr: string) => {
    if (!datetimeStr) return "";
    try {
      const date = new Date(datetimeStr);
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (e) {
      return datetimeStr; // return as is if parsing fails
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your tickets...</span>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12">
          <span className="material-icons text-destructive text-4xl mb-2">error_outline</span>
          <h3 className="text-lg font-semibold mb-2">Error Loading Tickets</h3>
          <p className="text-neutral">{error.message}</p>
        </div>
      </div>
    );
  }
  
  // Empty state when no tickets
  if (!tickets || tickets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Helmet>
          <title>My Tickets | TransitLedger</title>
          <meta name="description" content="View and manage your train tickets." />
        </Helmet>
        
        <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <span className="material-icons text-neutral text-4xl mb-2">confirmation_number</span>
              <h3 className="text-lg font-semibold mb-2">No Tickets Found</h3>
              <p className="text-neutral mb-4">You haven't booked any tickets yet.</p>
              <Button 
                onClick={() => navigate("/tickets")} 
                className="bg-primary hover:bg-primary-dark"
              >
                Browse Tickets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>My Tickets | TransitLedger</title>
        <meta name="description" content="View and manage your train tickets." />
      </Helmet>
      
      <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingTickets && upcomingTickets.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-white rounded-full w-5 h-5 inline-flex items-center justify-center">
                {upcomingTickets.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingTickets && upcomingTickets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <span className="material-icons text-neutral text-4xl mb-2">event_available</span>
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Tickets</h3>
                  <p className="text-neutral mb-4">You don't have any upcoming trips.</p>
                  <Button 
                    onClick={() => navigate("/tickets")} 
                    className="bg-primary hover:bg-primary-dark"
                  >
                    Browse Tickets
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingTickets?.map(ticket => (
                <Card key={ticket.id} className="relative overflow-hidden">
                  {ticket.paymentStatus === "pending" && (
                    <div className="absolute top-0 left-0 w-full p-2 bg-warning text-white text-center text-xs">
                      Payment Required - Complete your booking
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{ticket.schedule.train.name}</CardTitle>
                      {getStatusBadge(ticket.status, ticket.paymentStatus)}
                    </div>
                    <p className="text-sm text-neutral">Train #{ticket.schedule.train.trainNumber} - {formatDate(ticket.schedule.journeyDate)}</p>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <p className="text-xs text-neutral">From</p>
                        <p className="font-semibold">{formatStationName(ticket.schedule.fromStation)}</p>
                        <p className="text-sm">{formatTime(ticket.schedule.departureTime)}</p>
                      </div>
                      
                      <div className="flex-1 px-4">
                        <div className="flex items-center">
                          <div className="h-0.5 flex-grow bg-neutral-light"></div>
                          <span className="material-icons text-neutral mx-2">train</span>
                          <div className="h-0.5 flex-grow bg-neutral-light"></div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-neutral">To</p>
                        <p className="font-semibold">{formatStationName(ticket.schedule.toStation)}</p>
                        <p className="text-sm">{formatTime(ticket.schedule.arrivalTime)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-neutral">Seat:</span> {ticket.seatNumber}
                      </div>
                      <div>
                        <span className="text-neutral">Class:</span> {getSeatClassName(ticket)}
                      </div>
                      <div>
                        <span className="text-neutral">Price:</span> ৳{ticket.price}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    {ticket.paymentStatus === "pending" ? (
                      <Button 
                        onClick={() => navigate(`/payment/${ticket.id}`)} 
                        className="w-full bg-secondary hover:bg-secondary-dark"
                      >
                        Complete Payment
                      </Button>
                    ) : (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">View QR</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Your Ticket QR Code</DialogTitle>
                              <DialogDescription>
                                Present this QR code at the station for verification
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-center py-4">
                              <QRCodeSVG 
                                value={ticket.qrCode} 
                                size={200}
                              />
                            </div>
                            <div className="text-center mb-4">
                              <p className="font-medium">{ticket.schedule.train.name}</p>
                              <p className="text-sm">{formatDate(ticket.schedule.journeyDate)} • {formatTime(ticket.schedule.departureTime)}</p>
                              <p className="text-sm">Seat {ticket.seatNumber}</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              Cancel Ticket
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cancel Ticket</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to cancel this ticket? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-2">
                              <p className="font-medium">{ticket.schedule.train.name}</p>
                              <p className="text-sm">
                                {formatStationName(ticket.schedule.fromStation)} to {formatStationName(ticket.schedule.toStation)} on {formatDate(ticket.schedule.journeyDate)}
                              </p>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                Keep Ticket
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => handleCancelTicket(ticket.id)}
                                disabled={cancelTicketMutation.isPending}
                              >
                                {cancelTicketMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  "Cancel Ticket"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastTickets && pastTickets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <span className="material-icons text-neutral text-4xl mb-2">history</span>
                  <h3 className="text-lg font-semibold mb-2">No Past Tickets</h3>
                  <p className="text-neutral">Your past journeys will appear here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {pastTickets?.map(ticket => (
                <Card key={ticket.id} className="opacity-80">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{ticket.schedule.train.name}</CardTitle>
                      {getStatusBadge(ticket.status, ticket.paymentStatus)}
                    </div>
                    <p className="text-sm text-neutral">Train #{ticket.schedule.train.trainNumber} - {formatDate(ticket.schedule.journeyDate)}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <p className="text-xs text-neutral">From</p>
                        <p className="font-semibold">{formatStationName(ticket.schedule.fromStation)}</p>
                        <p className="text-sm">{formatTime(ticket.schedule.departureTime)}</p>
                      </div>
                      
                      <div className="flex-1 px-4">
                        <div className="flex items-center">
                          <div className="h-0.5 flex-grow bg-neutral-light"></div>
                          <span className="material-icons text-neutral mx-2">train</span>
                          <div className="h-0.5 flex-grow bg-neutral-light"></div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-neutral">To</p>
                        <p className="font-semibold">{formatStationName(ticket.schedule.toStation)}</p>
                        <p className="text-sm">{formatTime(ticket.schedule.arrivalTime)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-neutral">Seat:</span> {ticket.seatNumber}
                      </div>
                      <div>
                        <span className="text-neutral">Class:</span> {getSeatClassName(ticket)}
                      </div>
                      <div>
                        <span className="text-neutral">Price:</span> ৳{ticket.price}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled">
          {cancelledTickets && cancelledTickets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <span className="material-icons text-neutral text-4xl mb-2">cancel</span>
                  <h3 className="text-lg font-semibold mb-2">No Cancelled Tickets</h3>
                  <p className="text-neutral">You have no cancelled bookings.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {cancelledTickets?.map(ticket => (
                <Card key={ticket.id} className="opacity-70">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{ticket.schedule.train.name}</CardTitle>
                      {getStatusBadge(ticket.status, ticket.paymentStatus)}
                    </div>
                    <p className="text-sm text-neutral">Train #{ticket.schedule.train.trainNumber} - {formatDate(ticket.schedule.journeyDate)}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <p className="text-xs text-neutral">From</p>
                        <p className="font-semibold">{formatStationName(ticket.schedule.fromStation)}</p>
                        <p className="text-sm">{formatTime(ticket.schedule.departureTime)}</p>
                      </div>
                      
                      <div className="flex-1 px-4">
                        <div className="flex items-center">
                          <div className="h-0.5 flex-grow bg-neutral-light"></div>
                          <span className="material-icons text-neutral mx-2">train</span>
                          <div className="h-0.5 flex-grow bg-neutral-light"></div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-neutral">To</p>
                        <p className="font-semibold">{formatStationName(ticket.schedule.toStation)}</p>
                        <p className="text-sm">{formatTime(ticket.schedule.arrivalTime)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
