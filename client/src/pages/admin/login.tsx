import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Lock, Shield, User } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";

// Define login form schema with Zod
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [, setLocation] = useLocation();
  const { useAdminLogin } = useAdmin();
  const loginMutation = useAdminLogin();

  // Form validation with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginSchema) => {
    try {
      // Check if account is locked due to too many failed attempts
      if (isLocked) {
        setError("Account is temporarily locked. Please try again later.");
        return;
      }

      // Clear previous errors
      setError(null);
      setLoading(true);

      // Attempt to login as admin
      await loginMutation.mutateAsync(data);

      // Reset login attempts on successful login
      setLoginAttempts(0);
      
      // Short delay to allow the auth context to update
      setTimeout(() => {
        setLocation("/admin");
      }, 500);
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= 5) {
          setIsLocked(true);
          setTimeout(() => {
            setIsLocked(false);
            setLoginAttempts(0);
          }, 300000); // Lock for 5 minutes
        }
        return newAttempts;
      });
      
      // Improved error handling
      if (error instanceof Error) {
        // Specific error message for admin privileges
        if (error.message.includes("admin privileges")) {
          setError("This account does not have administrator privileges.");
        } else {
          setError(error.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-indigo-500" />
          <h1 className="mt-4 text-3xl font-bold text-white">Transit Ledger</h1>
          <p className="mt-2 text-gray-400">Admin Portal</p>
        </div>
        
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Administrator Login</CardTitle>
            <CardDescription className="text-center">
              Secure access for authorized personnel only
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your admin username"
                  autoComplete="username"
                  autoFocus
                  disabled={isLocked || loading}
                  {...register("username")}
                  className={`w-full ${errors.username ? 'border-red-500' : ''}`}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLocked || loading}
                  {...register("password")}
                  className={`w-full ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isLocked || loading}
              >
                {loading ? "Authenticating..." : isLocked ? "Account Locked" : "Login to Admin Panel"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-gray-500">
            <p>This is a secure system. Unauthorized access is prohibited.</p>
            {loginAttempts > 0 && (
              <p className="text-amber-500">
                Failed attempts: {loginAttempts}/5
                {loginAttempts >= 3 && " - Warning: Your account will be temporarily locked after 5 failed attempts"}
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 