import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashNID } from "./auth";
import { setupPaymentRoutes } from "./payment";
import { setupNIDVerification } from "./nid";
import { prisma } from "./prisma-client";
import { setupAdminRoutes } from "./admin";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up payment routes
  setupPaymentRoutes(app);
  
  // Set up NID verification routes
  setupNIDVerification(app);

  // Set up admin routes
  setupAdminRoutes(app);

  // Set up email verification routes
  app.post("/api/verify/email", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Find the latest email verification for this user
      const verification = await prisma.emailVerification.findFirst({
        where: {
          userId: parseInt(userId),
          verified: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!verification) {
        return res.status(404).json({ message: "No pending verification found" });
      }

      // Update the verification status
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      });

      // Update the user's verified status
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { verified: true },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // Get all trains
  app.get("/api/trains", async (req, res, next) => {
    try {
      const trains = await storage.getAllTrains();
      res.json(trains);
    } catch (error) {
      next(error);
    }
  });

  // Get train by ID
  app.get("/api/trains/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const train = await storage.getTrain(id);
      
      if (!train) {
        return res.status(404).json({ message: "Train not found" });
      }
      
      res.json(train);
    } catch (error) {
      next(error);
    }
  });

  // Get all schedules
  app.get("/api/schedules", async (req, res, next) => {
    try {
      const date = req.query.date as string;
      let schedules;
      
      if (date) {
        schedules = await storage.getSchedulesByJourneyDate(date);
      } else {
        schedules = await storage.getAllSchedules();
      }
      
      // Get train details for each schedule
      const schedulesWithTrains = await Promise.all(
        schedules.map(async (schedule) => {
          const train = await storage.getTrain(schedule.trainId);
          return {
            ...schedule,
            train
          };
        })
      );
      
      res.json(schedulesWithTrains);
    } catch (error) {
      next(error);
    }
  });

  // Get schedule by ID
  app.get("/api/schedules/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Use Prisma directly for this query to include seat schedules
      const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: {
          train: true,
          fromStation: true,
          toStation: true,
          seatSchedules: {
            include: {
              seat: true
            },
            where: {
              isBooked: false
            }
          }
        }
      });
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      // Group seat schedules by seat class for easier frontend consumption
      const seatClasses: Record<string, { count: number, price: number, seats: any[] }> = {};
      
      schedule.seatSchedules.forEach(seatSchedule => {
        const seatClass = seatSchedule.seat.seatClass;
        
        if (!seatClasses[seatClass]) {
          seatClasses[seatClass] = {
            count: 0,
            price: seatSchedule.price,
            seats: []
          };
        }
        
        seatClasses[seatClass].count++;
        seatClasses[seatClass].seats.push({
          id: seatSchedule.id,
          seatId: seatSchedule.seatId,
          seatNumber: seatSchedule.seat.seatNumber,
          carNumber: seatSchedule.seat.carNumber,
          position: seatSchedule.seat.position,
          price: seatSchedule.price
        });
      });
      
      res.json({
        ...schedule,
        seatClasses
      });
    } catch (error) {
      next(error);
    }
  });

  // Book a ticket
  app.post("/api/tickets/book", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user!.id;
      const { scheduleId, seatNumber, seatScheduleId } = req.body;
      
      // Check if schedule exists
      const schedule = await prisma.schedule.findUnique({
        where: { id: parseInt(scheduleId) },
        include: { seatSchedules: true }
      });
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      // Check if schedule has available seats
      if (schedule.availableSeats <= 0) {
        return res.status(400).json({ message: "No seats available for this schedule" });
      }
      
      // Check if user already has a ticket for this schedule
      const userTickets = await prisma.ticket.findMany({
        where: {
          userId,
          scheduleId: parseInt(scheduleId),
          status: { not: "cancelled" }
        }
      });
      
      if (userTickets.length > 0) {
        return res.status(400).json({ 
          message: "You already have a ticket for this train schedule" 
        });
      }
      
      // Find the seat schedule if provided
      let seatSchedule;
      if (seatScheduleId) {
        seatSchedule = await prisma.seatSchedule.findUnique({
          where: { id: parseInt(seatScheduleId.toString()) },
          include: { seat: true }
        });
        
        if (!seatSchedule) {
          return res.status(404).json({ message: "Seat not found" });
        }
        
        if (seatSchedule.isBooked) {
          return res.status(400).json({ message: "This seat is already booked" });
        }
        
        // Check if the seat number matches
        if (seatSchedule.seat.seatNumber !== seatNumber) {
          return res.status(400).json({ message: "Seat number doesn't match the selected seat" });
        }
      } else {
        // Check if seat is already taken (legacy method)
        const scheduleTickets = await prisma.ticket.findMany({
          where: { 
            scheduleId: parseInt(scheduleId),
            seatNumber,
            status: { not: "cancelled" }
          }
        });
        
        if (scheduleTickets.length > 0) {
          return res.status(400).json({ message: "This seat is already taken" });
        }
      }
      
      // Generate a unique ticket hash
      const ticketHash = crypto.randomBytes(16).toString('hex');
      const qrCode = `TL-${scheduleId}-${userId}-${ticketHash.substring(0, 8)}`;
      
      // Create a new ticket
      const ticket = await prisma.ticket.create({
        data: {
          userId,
          scheduleId: parseInt(scheduleId),
          seatNumber,
          paymentId: null,
          paymentStatus: "pending",
          ticketHash,
          qrCode,
          status: "booked",
          price: seatSchedule ? seatSchedule.price : 150,
          seatScheduleId: seatSchedule ? seatSchedule.id : null
        }
      });
      
      // Mark the seat as booked in the seat schedule if provided
      if (seatSchedule) {
        await prisma.seatSchedule.update({
          where: { id: seatSchedule.id },
          data: { isBooked: true }
        });
      }
      
      res.status(201).json(ticket);
    } catch (error) {
      next(error);
    }
  });

  // Get user's tickets
  app.get("/api/tickets/my", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user!.id;
      
      // Use Prisma directly to get the tickets with all related data
      const tickets = await prisma.ticket.findMany({
        where: { 
          userId 
        },
        include: {
          schedule: {
            include: {
              train: true,
              fromStation: true,
              toStation: true
            }
          },
          seatSchedule: {
            include: {
              seat: true
            }
          }
        },
        orderBy: {
          issuedAt: 'desc'
        }
      });
      
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      next(error);
    }
  });

  // Get ticket by ID
  app.get("/api/tickets/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      
      // Use Prisma to get the ticket with all related data
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          schedule: {
            include: {
              train: true,
              fromStation: true,
              toStation: true
            }
          },
          seatSchedule: {
            include: {
              seat: true
            }
          }
        }
      });
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Check if user owns the ticket or is an operator
      const userId = req.user!.id;
      const isAdmin = req.user!.isAdmin;
      
      if (ticket.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to view this ticket" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      next(error);
    }
  });

  // Cancel a ticket
  app.post("/api/tickets/:id/cancel", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      
      // Use Prisma to get the ticket with the seat schedule
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: { seatSchedule: true }
      });
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Check if user owns the ticket
      const userId = req.user!.id;
      
      if (ticket.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to cancel this ticket" });
      }
      
      // Check if ticket can be cancelled
      if (ticket.status === "cancelled") {
        return res.status(400).json({ message: "Ticket is already cancelled" });
      }
      
      if (ticket.status === "used") {
        return res.status(400).json({ message: "Cannot cancel a used ticket" });
      }
      
      // Update ticket status
      const updatedTicket = await prisma.ticket.update({
        where: { id },
        data: { 
          status: "cancelled",
          paymentStatus: "cancelled"
        }
      });
      
      // Update schedule available seats
      await prisma.schedule.update({
        where: { id: ticket.scheduleId },
        data: {
          availableSeats: {
            increment: 1
          }
        }
      });
      
      // If there's a seat schedule, mark it as not booked
      if (ticket.seatScheduleId) {
        await prisma.seatSchedule.update({
          where: { id: ticket.seatScheduleId },
          data: { isBooked: false }
        });
      }
      
      res.json(updatedTicket);
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      next(error);
    }
  });

  // Verify a ticket (for booth operators)
  app.post("/api/tickets/verify", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { ticketHash, nidHash } = req.body;
      const operatorId = req.user!.id;
      
      if (!ticketHash) {
        return res.status(400).json({ message: "Ticket hash is required" });
      }
      
      // Find ticket by hash
      const ticket = await storage.getTicketByHash(ticketHash);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Get user who owns the ticket
      const user = await storage.getUser(ticket.userId);
      
      if (!user) {
        return res.status(404).json({ message: "Ticket owner not found" });
      }
      
      // If NID hash is provided, verify it matches
      if (nidHash && user.nidHash !== nidHash) {
        return res.status(400).json({ message: "NID does not match ticket owner" });
      }
      
      // Check if ticket has already been used
      if (ticket.status === "used") {
        return res.status(400).json({ message: "Ticket has already been used" });
      }
      
      // Check if ticket has been cancelled
      if (ticket.status === "cancelled") {
        return res.status(400).json({ message: "Ticket has been cancelled" });
      }
      
      // Check if payment is completed
      if (ticket.paymentStatus !== "completed") {
        return res.status(400).json({ message: "Ticket payment is not completed" });
      }
      
      // Get schedule and train information
      const schedule = await storage.getSchedule(ticket.scheduleId);
      let train = null;
      
      if (schedule) {
        train = await storage.getTrain(schedule.trainId);
      }
      
      // Create verification record
      const verification = await storage.createTicketVerification({
        ticketId: ticket.id,
        verifiedBy: operatorId,
        location: req.body.location || "Unknown",
        status: "valid"
      });
      
      // Update ticket status to used
      await storage.updateTicketStatus(ticket.id, "used");
      
      res.json({
        success: true,
        message: "Ticket verified successfully",
        ticket: {
          ...ticket,
          status: "used"
        },
        user: {
          fullName: user.fullName,
          nidHash: user.nidHash
        },
        schedule,
        train,
        verification
      });
    } catch (error) {
      next(error);
    }
  });

  // Get all stations
  app.get("/api/stations", async (req, res, next) => {
    try {
      const stations = await prisma.station.findMany({
        where: {
          status: "operational"
        },
        orderBy: {
          name: 'asc'
        }
      });
      res.json(stations);
    } catch (error) {
      next(error);
    }
  });

  // Get station by ID
  app.get("/api/stations/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const station = await prisma.station.findUnique({
        where: { id }
      });
      
      if (!station) {
        return res.status(404).json({ message: "Station not found" });
      }
      
      res.json(station);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
