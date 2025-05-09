import { useState } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

const searchSchema = z.object({
  from: z.string().min(1, "Departure station is required"),
  to: z.string().min(1, "Arrival station is required"),
  journeyDate: z.string().min(1, "Journey date is required"),
  passengers: z.string().default("1"),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function TicketSearch() {
  const [, navigate] = useLocation();
  const { useStations } = useTickets();
  const { data: stations, isLoading: isLoadingStations } = useStations();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      from: "",
      to: "",
      journeyDate: new Date().toISOString().split("T")[0],
      passengers: "1",
    },
  });
  
  const onSubmit = (data: SearchFormValues) => {
    // Use the search parameters to navigate to tickets page with query params
    navigate(`/tickets?from=${data.from}&to=${data.to}&date=${data.journeyDate}&passengers=${data.passengers}`);
  };

  // Get the minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Find Your Train Ticket</h2>
        
        <div className="max-w-3xl mx-auto bg-neutral-lightest p-6 rounded-lg shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoadingStations}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingStations ? "Loading stations..." : "Select departure station"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingStations ? (
                            <div className="flex justify-center items-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="ml-2">Loading stations...</span>
                            </div>
                          ) : (
                            stations?.map((station: any) => (
                              <SelectItem key={station.id} value={station.id.toString()}>
                                {station.name}, {station.city}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoadingStations}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingStations ? "Loading stations..." : "Select arrival station"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingStations ? (
                            <div className="flex justify-center items-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="ml-2">Loading stations...</span>
                            </div>
                          ) : (
                            stations?.map((station: any) => (
                              <SelectItem 
                                key={station.id} 
                                value={station.id.toString()}
                                disabled={field.name === "to" && form.getValues("from") === station.id.toString()}
                              >
                                {station.name}, {station.city}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="journeyDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Journey Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          min={today}
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="passengers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passengers</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of passengers" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 Passenger</SelectItem>
                          <SelectItem value="2">2 Passengers</SelectItem>
                          <SelectItem value="3">3 Passengers</SelectItem>
                          <SelectItem value="4">4 Passengers</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="text-center">
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition shadow"
                  disabled={isLoadingStations}
                >
                  {isLoadingStations ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Search Tickets"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
