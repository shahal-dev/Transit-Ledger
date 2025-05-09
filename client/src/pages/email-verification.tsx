import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function EmailVerificationPage() {
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");

  const userId = searchParams.get("userId");
  const code = searchParams.get("code");

  // Handle verification from email link
  useEffect(() => {
    if (code && userId) {
      verifyEmailMutation.mutate({ userId: parseInt(userId), code });
    }
  }, [code, userId]);

  // Mutation for verifying email
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: { userId: number; code: string }) => {
      const res = await apiRequest("POST", "/api/verify-email", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Verification failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email verified successfully. You can now log in.",
      });
      // Redirect to login page after successful verification
      setTimeout(() => navigate("/auth"), 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for resending verification email
  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/resend-verification", { userId });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to resend verification email");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Verification email has been resent. Please check your inbox.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to resend",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleManualVerify = () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is missing",
        variant: "destructive",
      });
      return;
    }

    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    verifyEmailMutation.mutate({ userId: parseInt(userId), code: verificationCode });
  };

  const handleResend = () => {
    resendVerificationMutation.mutate();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Verify Your Email</h1>
        <p className="text-gray-500">
          Please enter the verification code sent to your email address or click the link in the email.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Input
          type="text"
          placeholder="Enter verification code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          disabled={verifyEmailMutation.isPending}
        />

        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleManualVerify}
            disabled={verifyEmailMutation.isPending}
          >
            {verifyEmailMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          <Button
            onClick={handleResend}
            disabled={resendVerificationMutation.isPending}
            variant="outline"
          >
            {resendVerificationMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              "Resend Verification Code"
            )}
          </Button>

          <Button
            onClick={() => navigate("/auth")}
            variant="ghost"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
} 