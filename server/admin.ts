import type { Express } from "express";
import { prisma } from "./prisma-client";
import { storage } from "./storage";
import adminRouter from "./routes/api/admin";

export function setupAdminRoutes(app: Express) {
  // Use the modular admin router for /api/admin routes
  app.use("/api/admin", adminRouter);

  // Middleware to check if user is admin (left for legacy routes)
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }
    next();
  };

  // Get all users
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          nidHash: true,
          verified: true,
          isAdmin: true,
          createdAt: true,
          wallet: {
            select: {
              id: true,
              balance: true
            }
          },
          _count: {
            select: {
              tickets: true
            }
          }
        }
      });
      
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all tickets
  app.get("/api/admin/tickets", isAdmin, async (req, res) => {
    try {
      const tickets = await prisma.ticket.findMany({
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          schedule: {
            include: {
              train: true
            }
          }
        }
      });
      
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  // Get all trains
  app.get("/api/admin/trains", isAdmin, async (req, res) => {
    try {
      const trains = await prisma.train.findMany({
        include: {
          schedules: {
            include: {
              train: true
            }
          },
          station: true
        }
      });
      
      // Add the schedules with proper train data structure
      const trainsWithFormattedSchedules = trains.map(train => {
        const formattedSchedules = train.schedules.map(schedule => ({
          ...schedule,
          train: {
            name: train.name,
            trainNumber: train.trainNumber
          }
        }));
        
        return {
          ...train,
          schedules: formattedSchedules
        };
      });
      
      res.json(trainsWithFormattedSchedules);
    } catch (error) {
      console.error("Error fetching trains:", error);
      res.status(500).json({ message: "Failed to fetch trains" });
    }
  });

  // Get all stations
  app.get("/api/admin/stations", isAdmin, async (req, res) => {
    try {
      const stations = await prisma.station.findMany({
        include: {
          trains: {
            where: {
              status: "active"
            }
          }
        }
      });
      
      // Format stations with additional derived information
      const formattedStations = stations.map(station => {
        // Calculate next departure if there are active trains
        let nextDeparture = null;
        if (station.trains.length > 0) {
          // Sort by departure time and take the first one
          const sortedTrains = [...station.trains].sort((a, b) => {
            return a.departureTime.localeCompare(b.departureTime);
          });
          nextDeparture = new Date().toISOString(); // Simulate a real date for now
        } else {
          nextDeparture = null;
        }
        
        return {
          id: station.id,
          name: station.name,
          city: station.city,
          status: station.status,
          platforms: station.platforms,
          activeTrains: station.trains.length,
          nextDeparture: nextDeparture,
          createdAt: station.createdAt,
          updatedAt: station.updatedAt
        };
      });
      
      res.json(formattedStations);
    } catch (error) {
      console.error("Error fetching stations:", error);
      res.status(500).json({ message: "Failed to fetch stations" });
    }
  });

  // Create a new station
  app.post("/api/admin/stations/create", isAdmin, async (req, res) => {
    try {
      const { name, city, platforms, status } = req.body;
      
      if (!name || !city) {
        return res.status(400).json({ message: "Name and city are required" });
      }
      
      const station = await prisma.station.create({
        data: {
          name,
          city,
          platforms: platforms || 1,
          status: status || "operational"
        }
      });
      
      res.status(201).json(station);
    } catch (error) {
      console.error("Error creating station:", error);
      res.status(500).json({ message: "Failed to create station" });
    }
  });
  
  // Update a station
  app.post("/api/admin/stations/edit", isAdmin, async (req, res) => {
    try {
      const { id, name, city, platforms, status } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "Station ID is required" });
      }
      
      const station = await prisma.station.update({
        where: { id: parseInt(id) },
        data: {
          name,
          city,
          platforms,
          status
        }
      });
      
      res.json(station);
    } catch (error) {
      console.error("Error updating station:", error);
      res.status(500).json({ message: "Failed to update station" });
    }
  });
  
  // Delete a station
  app.post("/api/admin/stations/delete", isAdmin, async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "Station ID is required" });
      }
      
      // First update any trains that reference this station
      await prisma.train.updateMany({
        where: { stationId: parseInt(id) },
        data: { stationId: null }
      });
      
      // Then delete the station
      await prisma.station.delete({
        where: { id: parseInt(id) }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting station:", error);
      res.status(500).json({ message: "Failed to delete station" });
    }
  });

  // Create a new train
  app.post("/api/admin/trains/create", isAdmin, async (req, res) => {
    try {
      const { 
        name, trainNumber, fromStation, toStation, departureTime, 
        arrivalTime, duration, type, totalSeats, stationId
      } = req.body;
      
      if (!name || !trainNumber || !fromStation || !toStation) {
        return res.status(400).json({ message: "Required fields are missing" });
      }
      
      const train = await prisma.train.create({
        data: {
          name,
          trainNumber,
          fromStation,
          toStation,
          departureTime,
          arrivalTime,
          duration,
          type,
          totalSeats: parseInt(totalSeats),
          availableSeats: parseInt(totalSeats),
          stationId: stationId ? parseInt(stationId) : null
        }
      });
      
      res.status(201).json(train);
    } catch (error) {
      console.error("Error creating train:", error);
      res.status(500).json({ message: "Failed to create train" });
    }
  });
  
  // Update train details
  app.post("/api/admin/trains/edit", isAdmin, async (req, res) => {
    try {
      const { 
        id, name, trainNumber, fromStation, toStation, departureTime, 
        arrivalTime, duration, type, totalSeats, availableSeats, stationId
      } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "Train ID is required" });
      }
      
      const train = await prisma.train.update({
        where: { id: parseInt(id) },
        data: {
          name,
          trainNumber,
          fromStation,
          toStation,
          departureTime,
          arrivalTime, 
          duration,
          type,
          totalSeats: totalSeats ? parseInt(totalSeats) : undefined,
          availableSeats: availableSeats ? parseInt(availableSeats) : undefined,
          stationId: stationId ? parseInt(stationId) : null
        }
      });
      
      res.json(train);
    } catch (error) {
      console.error("Error updating train:", error);
      res.status(500).json({ message: "Failed to update train" });
    }
  });
  
  // Delete a train
  app.post("/api/admin/trains/delete", isAdmin, async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "Train ID is required" });
      }
      
      // First check if train has any schedules
      const schedules = await prisma.schedule.findMany({
        where: { trainId: parseInt(id) }
      });
      
      if (schedules.length > 0) {
        // Has schedules, just mark as inactive instead of deleting
        await prisma.train.update({
          where: { id: parseInt(id) },
          data: { status: "inactive" }
        });
        
        return res.json({ 
          success: true, 
          message: "Train has schedules and cannot be deleted. It has been marked inactive instead."
        });
      }
      
      // No schedules, safe to delete
      await prisma.train.delete({
        where: { id: parseInt(id) }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting train:", error);
      res.status(500).json({ message: "Failed to delete train" });
    }
  });
  
  // Activate or deactivate a train
  app.post("/api/admin/trains/activate", isAdmin, async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "Train ID is required" });
      }
      
      await prisma.train.update({
        where: { id: parseInt(id) },
        data: { status: "active" }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error activating train:", error);
      res.status(500).json({ message: "Failed to activate train" });
    }
  });
  
  app.post("/api/admin/trains/deactivate", isAdmin, async (req, res) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "Train ID is required" });
      }
      
      await prisma.train.update({
        where: { id: parseInt(id) },
        data: { status: "maintenance" }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deactivating train:", error);
      res.status(500).json({ message: "Failed to deactivate train" });
    }
  });

  // Get dashboard stats
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const userCount = await prisma.user.count();
      const ticketCount = await prisma.ticket.count();
      const trainCount = await prisma.train.count();
      const scheduleCount = await prisma.schedule.count();
      const stationCount = await prisma.station.count();
      
      // Recent ticket data
      const recentTickets = await prisma.ticket.findMany({
        take: 5,
        orderBy: {
          issuedAt: 'desc'
        },
        include: {
          user: {
            select: {
              fullName: true
            }
          }
        }
      });
      
      // Calculate revenue
      const tickets = await prisma.ticket.findMany({
        where: {
          paymentStatus: 'completed'
        },
        select: {
          price: true
        }
      });
      
      const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
      
      // Get active users (users who booked a ticket in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsers = await prisma.user.count({
        where: {
          tickets: {
            some: {
              issuedAt: {
                gte: thirtyDaysAgo
              }
            }
          }
        }
      });
      
      res.json({
        userCount,
        ticketCount,
        trainCount,
        scheduleCount,
        stationCount,
        activeUsers,
        totalRevenue,
        recentActivity: recentTickets
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Confirm a ticket
  app.post("/api/admin/tickets/:id/confirm", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (!id) {
        return res.status(400).json({ message: "Ticket ID is required" });
      }
      
      // Check if ticket exists
      const ticket = await prisma.ticket.findUnique({
        where: { id }
      });
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Update ticket status
      await prisma.ticket.update({
        where: { id },
        data: { status: "confirmed" }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error confirming ticket:", error);
      res.status(500).json({ message: "Failed to confirm ticket" });
    }
  });
  
  // Cancel a ticket
  app.post("/api/admin/tickets/:id/cancel", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (!id) {
        return res.status(400).json({ message: "Ticket ID is required" });
      }
      
      // Check if ticket exists
      const ticket = await prisma.ticket.findUnique({
        where: { id }
      });
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Check if ticket is already cancelled
      if (ticket.status === "cancelled") {
        return res.status(400).json({ message: "Ticket is already cancelled" });
      }
      
      // Update ticket status
      await prisma.ticket.update({
        where: { id },
        data: { status: "cancelled" }
      });
      
      // Update available seats in schedule
      await prisma.schedule.update({
        where: { id: ticket.scheduleId },
        data: {
          availableSeats: {
            increment: 1
          }
        }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      res.status(500).json({ message: "Failed to cancel ticket" });
    }
  });
} 