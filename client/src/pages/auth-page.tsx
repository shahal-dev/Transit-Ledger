import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z.string().min(11, "Phone number must be at least 11 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  nidNumber: z.string().min(10, "NID must be at least 10 digits").max(17, "NID cannot be more than 17 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // If user is already logged in, redirect to home page
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      email: "",
      nidNumber: "",
      dateOfBirth: "",
      acceptTerms: false,
    },
  });

  // Form submission handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    // The full NID verification and hashing is handled in the registerMutation
    registerMutation.mutate(data, {
      onSuccess: (result) => {
        // Redirect to verification page with userId
        navigate(`/email-verification?userId=${result.userId}`);
      }
    });
  };

  // Skip rendering if user is already logged in
  if (user) {
    return <div className="flex justify-center items-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hero Section */}
          <div className="p-6 flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-4 text-primary">Welcome to TransitLedger</h1>
            <p className="text-lg mb-6">Bangladesh's first digital train ticketing platform with secure verification and easy booking.</p>

            <div className="bg-neutral-lightest p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4 text-primary">Why Choose TransitLedger?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center">
                {/* Secure Verification */}
                <div>
                  <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary">
                    <span className="material-icons text-white !text-white text-3xl">verified_user</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Secure Verification</h3>
                  <p className="text-neutral-700 text-sm">
                    NID or passport verification ensures a secure and reliable ticketing process.
                  </p>
                </div>
                {/* QR Code Tickets */}
                <div>
                  <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary">
                    <span className="material-icons text-white !text-white text-3xl">qr_code</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">QR Code Tickets</h3>
                  <p className="text-neutral-700 text-sm">
                    Easy verification at stations with digital QR code tickets on your mobile device.
                  </p>
                </div>
                {/* Easy Payment */}
                <div>
                  <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary">
                    <span className="material-icons text-white !text-white text-3xl">payments</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Easy Payment</h3>
                  <p className="text-neutral-700 text-sm">Integrated with popular mobile payment systems like bKash and Nagad.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 overflow-hidden opacity-10 -z-10">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1555661530-68c8e98db4e6?auto=format&q=80&w=2000')] bg-cover"></div>
              </div>
              <div className="bg-primary bg-opacity-90 text-white p-6 rounded-lg">
                <h3 className="font-semibold mb-2">About TransitLedger</h3>
                <p className="text-sm mb-4">TransitLedger is modernizing the railway ticketing system in Bangladesh, making it easier and more secure for travelers.</p>
                <p className="text-xs">Our platform ensures that tickets are linked to your identity, preventing fraud and unauthorized transfers.</p>
              </div>
            </div>
          </div>

          {/* Auth Forms */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2" aria-label="Authentication options">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login" role="tabpanel">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to Your Account</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your tickets and bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Remember me</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary-dark"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <p className="text-sm text-neutral-600">
                      Don't have an account?{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-primary hover:text-primary-dark"
                        onClick={() => setActiveTab("register")}
                      >
                        Register
                      </Button>
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register" role="tabpanel">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                      Register to start booking train tickets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Choose a username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Create a password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Confirm your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="01XXXXXXXXX" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Your email address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="nidNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>NID Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your national ID number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="acceptTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  I accept the <a href="#" className="text-primary hover:underline">terms and conditions</a>
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />

                        <div className="space-y-2">
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary-dark"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying identity...
                              </>
                            ) : (
                              "Register"
                            )}
                          </Button>
                          <p className="text-xs text-neutral text-center">
                            We'll verify your identity using the Bangladesh National ID database.
                            Make sure your information matches your NID records exactly.
                          </p>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <p className="text-sm text-neutral-600">
                      Already have an account?{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-primary hover:text-primary-dark"
                        onClick={() => setActiveTab("login")}
                      >
                        Login
                      </Button>
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}