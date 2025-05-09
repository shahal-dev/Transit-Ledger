import { Express } from "express";
import { randomBytes } from "crypto";
import { storage } from "./storage";

// Mock payment providers (bKash, Nagad, etc.)
interface PaymentProvider {
  name: string;
  processPayment: (amount: number, phoneNumber: string) => Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }>;
  verifyPayment: (transactionId: string) => Promise<{
    success: boolean;
    amount?: number;
    error?: string;
  }>;
}

// Mock implementation of payment providers
const bKashProvider: PaymentProvider = {
  name: "bKash",
  async processPayment(amount, phoneNumber) {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 90% success rate for simulation
    const success = Math.random() > 0.1;
    if (success) {
      return {
        success: true,
        transactionId: `BK${randomBytes(8).toString("hex").toUpperCase()}`
      };
    } else {
      return {
        success: false,
        error: "Payment failed. Please try again."
      };
    }
  },
  async verifyPayment(transactionId) {
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 95% success rate for verification
    const success = Math.random() > 0.05;
    if (success) {
      return {
        success: true,
        amount: 150 // Fixed ticket price
      };
    } else {
      return {
        success: false,
        error: "Transaction verification failed"
      };
    }
  }
};

const nagadProvider: PaymentProvider = {
  name: "Nagad",
  async processPayment(amount, phoneNumber) {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // 90% success rate for simulation
    const success = Math.random() > 0.1;
    if (success) {
      return {
        success: true,
        transactionId: `NG${randomBytes(8).toString("hex").toUpperCase()}`
      };
    } else {
      return {
        success: false,
        error: "Payment failed. Please try again."
      };
    }
  },
  async verifyPayment(transactionId) {
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // 95% success rate for verification
    const success = Math.random() > 0.05;
    if (success) {
      return {
        success: true,
        amount: 150 // Fixed ticket price
      };
    } else {
      return {
        success: false,
        error: "Transaction verification failed"
      };
    }
  }
};

// Map of available payment providers
const paymentProviders: Record<string, PaymentProvider> = {
  bkash: bKashProvider,
  nagad: nagadProvider
};

export function setupPaymentRoutes(app: Express) {
  // Initiate payment
  app.post("/api/payment/init", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const { provider, phoneNumber, ticketId } = req.body;
      
      // Validate required fields
      if (!provider || !phoneNumber || !ticketId) {
        return res.status(400).json({
          message: "Provider, phone number, and ticket ID are required"
        });
      }
      
      // Check if provider is supported
      const paymentProvider = paymentProviders[provider.toLowerCase()];
      if (!paymentProvider) {
        return res.status(400).json({
          message: `Payment provider ${provider} is not supported`
        });
      }
      
      // Get the ticket to check if it exists and payment status
      const ticket = await storage.getTicket(parseInt(ticketId));
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      if (ticket.paymentStatus === "completed") {
        return res.status(400).json({ message: "Payment already completed for this ticket" });
      }
      
      // Process payment with the selected provider
      const payment = await paymentProvider.processPayment(150, phoneNumber);
      
      if (payment.success && payment.transactionId) {
        // Update ticket with payment ID and pending status
        await storage.updateTicketPaymentStatus(ticket.id, "pending", payment.transactionId);
        
        res.status(200).json({
          success: true,
          message: "Payment initiated successfully",
          transactionId: payment.transactionId,
          provider: paymentProvider.name
        });
      } else {
        res.status(400).json({
          success: false,
          message: payment.error || "Payment processing failed"
        });
      }
    } catch (error) {
      next(error);
    }
  });

  // Verify payment
  app.post("/api/payment/verify", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const { provider, transactionId, ticketId } = req.body;
      
      // Validate required fields
      if (!provider || !transactionId || !ticketId) {
        return res.status(400).json({
          message: "Provider, transaction ID, and ticket ID are required"
        });
      }
      
      // Check if provider is supported
      const paymentProvider = paymentProviders[provider.toLowerCase()];
      if (!paymentProvider) {
        return res.status(400).json({
          message: `Payment provider ${provider} is not supported`
        });
      }
      
      // Get the ticket to check if it exists and payment status
      const ticket = await storage.getTicket(parseInt(ticketId));
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      if (ticket.paymentStatus === "completed") {
        return res.status(400).json({ message: "Payment already completed for this ticket" });
      }
      
      if (ticket.paymentId !== transactionId) {
        return res.status(400).json({ message: "Transaction ID does not match ticket payment" });
      }
      
      // Verify payment with the selected provider
      const verification = await paymentProvider.verifyPayment(transactionId);
      
      if (verification.success) {
        // Update ticket with completed payment status
        await storage.updateTicketPaymentStatus(ticket.id, "completed", transactionId);
        
        // Also update ticket status to booked
        await storage.updateTicketStatus(ticket.id, "confirmed");
        
        // Update schedule available seats
        const schedule = await storage.getSchedule(ticket.scheduleId);
        if (schedule) {
          await storage.updateScheduleAvailableSeats(
            schedule.id, 
            schedule.availableSeats - 1
          );
        }
        
        // Get updated ticket
        const updatedTicket = await storage.getTicket(ticket.id);
        
        res.status(200).json({
          success: true,
          message: "Payment verified successfully",
          ticket: updatedTicket
        });
      } else {
        res.status(400).json({
          success: false,
          message: verification.error || "Payment verification failed"
        });
      }
    } catch (error) {
      next(error);
    }
  });

  // Add funds to wallet
  app.post("/api/wallet/add-funds", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const userId = req.user?.id;
      const { provider, phoneNumber, amount } = req.body;
      
      // Validate required fields
      if (!provider || !phoneNumber || !amount) {
        return res.status(400).json({
          message: "Provider, phone number, and amount are required"
        });
      }
      
      // Check if provider is supported
      const paymentProvider = paymentProviders[provider.toLowerCase()];
      if (!paymentProvider) {
        return res.status(400).json({
          message: `Payment provider ${provider} is not supported`
        });
      }
      
      // Get user wallet
      const wallet = await storage.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Process payment with the selected provider
      const payment = await paymentProvider.processPayment(amount, phoneNumber);
      
      if (payment.success && payment.transactionId) {
        // Create transaction record
        const transaction = await storage.createTransaction({
          walletId: wallet.id,
          amount: amount,
          type: "credit",
          description: `Add funds via ${paymentProvider.name}`,
          paymentId: payment.transactionId,
          paymentMethod: paymentProvider.name,
          status: "completed"
        });
        
        // Update wallet balance
        const updatedWallet = await storage.updateWalletBalance(wallet.id, amount);
        
        res.status(200).json({
          success: true,
          message: "Funds added successfully",
          wallet: updatedWallet,
          transaction
        });
      } else {
        res.status(400).json({
          success: false,
          message: payment.error || "Payment processing failed"
        });
      }
    } catch (error) {
      next(error);
    }
  });

  // Get wallet balance and transactions
  app.get("/api/wallet", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const userId = req.user?.id;
      
      // Get user wallet
      const wallet = await storage.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Get transactions
      const transactions = await storage.getTransactionsByWalletId(wallet.id);
      
      res.status(200).json({
        wallet,
        transactions
      });
    } catch (error) {
      next(error);
    }
  });
}
