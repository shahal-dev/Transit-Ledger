import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "wouter";
import { z } from "zod";
import { SHA256 } from "crypto-js";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
  rememberMe: boolean;
};

// Extended registration schema with verification
// We omit nidHash as it will be generated on the server
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z.string().min(11, "Phone number must be at least 11 characters"),
  email: z.string().email("Invalid email address").optional().nullable(),
  nidNumber: z.string().min(10, "NID must be at least 10 digits").max(17, "NID cannot be more than 17 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
});

type RegisterData = z.infer<typeof registerSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

// Hash NID for privacy
function hashNID(nid: string): string {
  return SHA256(nid).toString();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // First verify NID
      const nidRes = await apiRequest("POST", "/api/verify/nid", {
        nidNumber: data.nidNumber,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth
      });

      if (!nidRes.ok) {
        const error = await nidRes.json();
        throw new Error(error.message);
      }

      // Then register user
      const registerRes = await apiRequest("POST", "/api/register", {
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        nidHash: hashNID(data.nidNumber),
        phone: data.phone,
        email: data.email
      });

      if (!registerRes.ok) {
        const error = await registerRes.json();
        throw new Error(error.message);
      }

      const result = await registerRes.json();
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
      // Redirect to verification page
      navigate(`/verify-email?userId=${data.userId}`);
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to register",
        variant: "destructive",
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Logout failed");
      }
    },
    onSuccess: () => {
      // Clear all queries from the cache
      queryClient.clear();
      // Set user to null
      queryClient.setQueryData(["/api/user"], null);
      // Navigate to login page
      navigate("/auth");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
