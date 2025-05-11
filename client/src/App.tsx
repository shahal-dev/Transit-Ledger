import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import TicketsPage from "@/pages/tickets-page";
import TicketDetailsPage from "@/pages/ticket-details-page";
import PaymentPage from "@/pages/payment-page";
import MyTicketsPage from "@/pages/my-tickets-page";
import MyWalletPage from "@/pages/my-wallet-page";
import VerifyTicketPage from "@/pages/verify-ticket-page";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ThemeProvider } from "next-themes";
import { Router } from "wouter";
import { routes } from "./routes";
import { setupWebSocket, closeWebSocket } from "./lib/websocket";
import { useEffect } from "react";
import EmailVerificationPage from "./pages/email-verification";
import ProfilePage from "@/pages/profile";
import AdminLoginPage from "@/pages/admin/login";
import AdminPage from "@/pages/admin";

// Admin route component that checks for admin privileges
function AdminRoute(props: { component: React.ComponentType<any>; path: string }) {
  const Component = props.component;
  return (
    <ProtectedRoute
      path={props.path}
      component={(params: any) => {
        const { user } = useAuth();
        if (!user?.isAdmin) {
          return <Redirect to="/admin/login" />;
        }
        return <Component {...params} />;
      }}
    />
  );
}

function AppRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Switch>
        {/* Admin routes */}
        <Route path="/admin/login" component={AdminLoginPage} />
        <AdminRoute path="/admin" component={AdminPage} />
        
        {/* Regular routes */}
        <Route>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Switch>
                <Route path="/" component={HomePage} />
                <Route path="/auth" component={AuthPage} />
                <Route path="/tickets" component={TicketsPage} />
                <ProtectedRoute path="/tickets/:id" component={TicketDetailsPage} />
                <ProtectedRoute path="/payment/:id" component={PaymentPage} />
                <ProtectedRoute path="/my-tickets" component={MyTicketsPage} />
                <ProtectedRoute path="/my-wallet" component={MyWalletPage} />
                <ProtectedRoute path="/verify-ticket" component={VerifyTicketPage} />
                <ProtectedRoute path="/profile" component={ProfilePage} />
                <Route path="/email-verification" component={EmailVerificationPage} />
                <Route component={NotFound} />
              </Switch>
            </main>
            <Footer />
          </div>
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Setup WebSocket connection once on app initialization
    setupWebSocket();
    
    // Cleanup on component unmount
    return () => {
      closeWebSocket();
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <AppRouter />
            </TooltipProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
