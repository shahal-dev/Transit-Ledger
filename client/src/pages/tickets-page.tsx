import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTickets } from "@/hooks/use-tickets";
import AvailableTickets from "@/components/tickets/available-tickets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function TicketsPage() {
  const { useStations } = useTickets();
  const { data: stations, isLoading: isLoadingStations } = useStations();
  
  const [searchParams, setSearchParams] = useState({
    fromStation: "",
    toStation: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Parse URL query params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromStation = urlParams.get("from");
    const toStation = urlParams.get("to");
    const date = urlParams.get("date");
    
    if (fromStation || toStation || date) {
      setSearchParams({
        fromStation: fromStation || "",
        toStation: toStation || "",
        date: date || new Date().toISOString().split("T")[0],
      });
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update the URL with search params without reloading the page
    const queryParams = new URLSearchParams();
    if (searchParams.fromStation) queryParams.set("from", searchParams.fromStation);
    if (searchParams.toStation) queryParams.set("to", searchParams.toStation);
    if (searchParams.date) queryParams.set("date", searchParams.date);
    
    window.history.pushState({}, "", `${window.location.pathname}?${queryParams.toString()}`);
  };

  // Helper function to get station name by ID
  const getStationName = (stationId: string) => {
    if (!stations || !stationId) return "";
    const station = stations.find((s: any) => s.id.toString() === stationId);
    return station ? `${station.name}, ${station.city}` : "";
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Book Tickets | TransitLedger</title>
        <meta name="description" content="Search and book train tickets" />
      </Helmet>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Tickets</CardTitle>
          <CardDescription>Find available train tickets for your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Select
                  value={searchParams.fromStation}
                  onValueChange={(value) => setSearchParams({ ...searchParams, fromStation: value })}
                  disabled={isLoadingStations}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingStations ? "Loading stations..." : "From Station"} />
                  </SelectTrigger>
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
              </div>
              <div>
                <Select
                  value={searchParams.toStation}
                  onValueChange={(value) => setSearchParams({ ...searchParams, toStation: value })}
                  disabled={isLoadingStations}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingStations ? "Loading stations..." : "To Station"} />
                  </SelectTrigger>
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
                          disabled={searchParams.fromStation === station.id.toString()}
                        >
                          {station.name}, {station.city}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
          </div>
            <Button type="submit" className="w-full" disabled={isLoadingStations}>
              {isLoadingStations ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Search Tickets"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {searchParams.fromStation || searchParams.toStation || searchParams.date ? (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Search Results</h2>
          {searchParams.fromStation && (
            <p className="text-sm text-muted-foreground">From: {getStationName(searchParams.fromStation)}</p>
          )}
          {searchParams.toStation && (
            <p className="text-sm text-muted-foreground">To: {getStationName(searchParams.toStation)}</p>
          )}
          {searchParams.date && (
            <p className="text-sm text-muted-foreground">Date: {new Date(searchParams.date).toLocaleDateString()}</p>
          )}
        </div>
      ) : null}
          
      <AvailableTickets 
        fromStation={searchParams.fromStation}
        toStation={searchParams.toStation}
        date={searchParams.date}
      />
    </div>
  );
}
