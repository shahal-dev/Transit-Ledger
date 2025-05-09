import { useState, useRef, useEffect } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Note: In a real implementation, we would use a QR scanner library
// For simplicity in this implementation, we'll use a text input to simulate QR scanning

export default function QRScanner({ onVerificationResult }: { onVerificationResult: (result: any) => void }) {
  const [ticketHash, setTicketHash] = useState("");
  const [scanning, setScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const { useVerifyTicket } = useTickets();
  const { toast } = useToast();
  const verifyTicketMutation = useVerifyTicket();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (manualEntry && inputRef.current) {
      inputRef.current.focus();
    }
  }, [manualEntry]);

  const handleVerify = async () => {
    if (!ticketHash) {
      toast({
        title: "Verification failed",
        description: "Please enter a ticket code",
        variant: "destructive",
      });
      return;
    }

    try {
      setScanning(true);
      const result = await verifyTicketMutation.mutateAsync({ ticketHash });
      onVerificationResult(result);
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Could not verify ticket",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
      setTicketHash("");
    }
  };

  const startScanning = () => {
    // In a real implementation, this would activate the device camera
    // For this demo, we'll just toggle to manual entry mode
    setManualEntry(true);
    toast({
      title: "Camera functionality",
      description: "In a real application, this would activate your camera. Please use manual entry for this demo.",
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <span className="material-icons text-4xl text-primary mb-2">qr_code_scanner</span>
          <h2 className="text-xl font-semibold mb-1">Ticket Verification</h2>
          <p className="text-sm text-neutral">Scan the QR code or enter the ticket code manually</p>
        </div>

        {manualEntry ? (
          <div className="space-y-4">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Enter ticket code"
                value={ticketHash}
                onChange={(e) => setTicketHash(e.target.value)}
                className="pr-20"
              />
              {ticketHash && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setTicketHash("")}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleVerify}
                disabled={!ticketHash || scanning}
                className="bg-primary hover:bg-primary-dark w-full"
              >
                {scanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Ticket"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setManualEntry(false)}
                disabled={scanning}
              >
                Back to Scanner
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]">
              <span className="material-icons text-4xl text-neutral-light mb-2">
                photo_camera
              </span>
              <p className="text-center text-sm text-neutral">
                Point your camera at the QR code on the ticket
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                onClick={startScanning}
                className="bg-primary hover:bg-primary-dark w-full"
              >
                Start Scanner
              </Button>
              <Button
                variant="outline"
                onClick={() => setManualEntry(true)}
              >
                Enter Code Manually
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
