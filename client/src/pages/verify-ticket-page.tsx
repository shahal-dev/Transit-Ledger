import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QRScanner from "@/components/verification/qr-scanner";
import TicketValidator from "@/components/verification/ticket-validator";
import { Redirect } from "wouter";

export default function VerifyTicketPage() {
  const { user } = useAuth();
  const [verificationResult, setVerificationResult] = useState<any>(null);
  
  const handleReset = () => {
    setVerificationResult(null);
  };
  
  // Only verified operators should access this page
  if (!user?.verified) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You do not have permission to access the ticket verification system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-neutral">
              This feature is only available to verified ticket operators. Please contact the administrator if you believe you should have access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>Verify Tickets | TransitLedger</title>
        <meta name="description" content="Operator interface for verifying passenger tickets." />
      </Helmet>
      
      <h1 className="text-2xl font-bold mb-6 text-center">Ticket Verification System</h1>
      
      <div className="max-w-md mx-auto mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Booth Operator Interface</CardTitle>
            <CardDescription className="text-center">
              Scan passenger QR codes or enter ticket details to verify validity
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-center items-center py-2 mb-2">
              <span className="material-icons text-primary mr-2">badge</span>
              <span className="font-medium">{user.fullName}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {verificationResult ? (
        <TicketValidator result={verificationResult} onReset={handleReset} />
      ) : (
        <QRScanner onVerificationResult={setVerificationResult} />
      )}
    </div>
  );
}
