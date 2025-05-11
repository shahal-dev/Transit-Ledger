import { PrismaClient } from '@prisma/client';
import express from 'express';
import { prisma } from '../../prisma-client';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }
  next();
};

// Trains management
router.get('/trains', isAdmin, async (req, res) => {
  try {
    const trains = await prisma.train.findMany({
      include: {
        schedules: true,
        seats: true
      }
    });
    res.json(trains);
  } catch (error) {
    console.error('Error fetching trains:', error);
    res.status(500).json({ error: 'Failed to fetch trains' });
  }
});

router.post('/trains/create', isAdmin, async (req, res) => {
  try {
    const { name, trainNumber, type, status } = req.body;
    
    const newTrain = await prisma.train.create({
      data: {
        name,
        trainNumber,
        type,
        status: status || 'active'
      }
    });
    
    res.json({ message: 'Train created successfully', train: newTrain });
  } catch (error) {
    console.error('Error creating train:', error);
    res.status(500).json({ error: 'Failed to create train' });
  }
});

router.post('/trains/edit', isAdmin, async (req, res) => {
  try {
    const { id, name, trainNumber, type, status } = req.body;
    
    const updatedTrain = await prisma.train.update({
      where: { id: parseInt(id) },
      data: {
        name,
        trainNumber,
        type,
        status
      }
    });
    
    res.json({ message: 'Train updated successfully', train: updatedTrain });
  } catch (error) {
    console.error('Error updating train:', error);
    res.status(500).json({ error: 'Failed to update train' });
  }
});

router.post('/trains/delete', isAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    
    // Check if the train is used in any schedules
    const schedules = await prisma.schedule.findMany({
      where: { trainId: parseInt(id) }
    });
    
    if (schedules.length > 0) {
      // Just mark as inactive instead of deleting
      await prisma.train.update({
        where: { id: parseInt(id) },
        data: { status: 'inactive' }
      });
      
      res.json({ message: 'Train marked as inactive (has schedules)' });
    } else {
      // Delete seats associated with the train
      await prisma.seat.deleteMany({
        where: { trainId: parseInt(id) }
      });
      
      // Safe to delete the train
      await prisma.train.delete({
        where: { id: parseInt(id) }
      });
      
      res.json({ message: 'Train deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting train:', error);
    res.status(500).json({ error: 'Failed to delete train' });
  }
});

router.post('/trains/activate', isAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    
    await prisma.train.update({
      where: { id: parseInt(id) },
      data: { status: 'active' }
    });
    
    res.json({ message: 'Train activated successfully' });
  } catch (error) {
    console.error('Error activating train:', error);
    res.status(500).json({ error: 'Failed to activate train' });
  }
});

router.post('/trains/deactivate', isAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    
    await prisma.train.update({
      where: { id: parseInt(id) },
      data: { status: 'maintenance' }
    });
    
    res.json({ message: 'Train set to maintenance successfully' });
  } catch (error) {
    console.error('Error deactivating train:', error);
    res.status(500).json({ error: 'Failed to deactivate train' });
  }
});

// Schedules management
router.get('/schedules', isAdmin, async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        train: true,
        fromStation: true,
        toStation: true,
        tickets: {
          select: {
            id: true,
            status: true
          }
        },
        seatSchedules: {
          select: {
            id: true,
            isBooked: true
          }
        }
      }
    });
    
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

router.post('/schedules/create', isAdmin, async (req, res) => {
  try {
    const {
      trainId,
      fromStationId,
      toStationId,
      journeyDate,
      departureTime,
      arrivalTime,
      availableSeats,
      status
    } = req.body;
    
    const newSchedule = await prisma.schedule.create({
      data: {
        trainId: parseInt(trainId),
        fromStationId: parseInt(fromStationId),
        toStationId: parseInt(toStationId),
        journeyDate,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        availableSeats: parseInt(availableSeats),
        status: status || 'scheduled'
      },
      include: {
        train: true,
        fromStation: true,
        toStation: true
      }
    });
    
    res.json({ message: 'Schedule created successfully', schedule: newSchedule });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

router.post('/schedules/edit', isAdmin, async (req, res) => {
  try {
    const {
      id,
      trainId,
      fromStationId,
      toStationId,
      journeyDate,
      departureTime,
      arrivalTime,
      availableSeats,
      status
    } = req.body;
    
    const updatedSchedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: {
        trainId: parseInt(trainId),
        fromStationId: parseInt(fromStationId),
        toStationId: parseInt(toStationId),
        journeyDate,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        availableSeats: parseInt(availableSeats),
        status
      },
      include: {
        train: true,
        fromStation: true,
        toStation: true
      }
    });
    
    res.json({ message: 'Schedule updated successfully', schedule: updatedSchedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

router.post('/schedules/delete', isAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    
    // Check if there are any tickets for this schedule
    const tickets = await prisma.ticket.findMany({
      where: { scheduleId: parseInt(id) }
    });
    
    if (tickets.length > 0) {
      // Just mark as cancelled instead of deleting
      await prisma.schedule.update({
        where: { id: parseInt(id) },
        data: { status: 'cancelled' }
      });
      
      res.json({ message: 'Schedule marked as cancelled (has tickets)' });
    } else {
      // Delete seat schedules first
      await prisma.seatSchedule.deleteMany({
        where: { scheduleId: parseInt(id) }
      });
      
      // Safe to delete
      await prisma.schedule.delete({
        where: { id: parseInt(id) }
      });
      
      res.json({ message: 'Schedule deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

router.post('/schedules/update-status', isAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    
    await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    
    res.json({ message: `Schedule status updated to ${status}` });
  } catch (error) {
    console.error('Error updating schedule status:', error);
    res.status(500).json({ error: 'Failed to update schedule status' });
  }
});

// Seats management
router.get('/seats', isAdmin, async (req, res) => {
  try {
    const seats = await prisma.seat.findMany({
      include: {
        train: {
          select: {
            name: true,
            trainNumber: true
          }
        }
      }
    });
    
    res.json(seats);
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

router.post('/seats', isAdmin, async (req, res) => {
  const { action, seatId, updates } = req.body;
  
  try {
    if (action === 'create') {
      const newSeat = await prisma.seat.create({
        data: {
          trainId: updates.trainId,
          seatNumber: updates.seatNumber,
          seatClass: updates.seatClass,
          carNumber: updates.carNumber,
          position: updates.position,
          features: updates.features,
          status: 'active'
        }
      });
      
      res.json({ message: 'Seat created successfully', seat: newSeat });
    } 
    else if (action === 'edit') {
      const updatedSeat = await prisma.seat.update({
        where: { id: seatId },
        data: {
          trainId: updates.trainId,
          seatNumber: updates.seatNumber,
          seatClass: updates.seatClass,
          carNumber: updates.carNumber,
          position: updates.position,
          features: updates.features
        }
      });
      
      res.json({ message: 'Seat updated successfully', seat: updatedSeat });
    } 
    else if (action === 'delete') {
      // Check if seat is in use in any schedules
      const seatSchedules = await prisma.seatSchedule.findMany({
        where: { seatId }
      });
      
      if (seatSchedules.length > 0) {
        // Just mark as inactive instead of deleting
        await prisma.seat.update({
          where: { id: seatId },
          data: { status: 'inactive' }
        });
      } else {
        // Safe to delete
        await prisma.seat.delete({
          where: { id: seatId }
        });
      }
      
      res.json({ message: 'Seat deleted successfully' });
    } 
    else if (action === 'activate') {
      await prisma.seat.update({
        where: { id: seatId },
        data: { status: 'active' }
      });
      
      res.json({ message: 'Seat activated successfully' });
    } 
    else if (action === 'deactivate') {
      await prisma.seat.update({
        where: { id: seatId },
        data: { status: 'maintenance' }
      });
      
      res.json({ message: 'Seat set to maintenance successfully' });
    } 
    else {
      res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error) {
    console.error('Error managing seat:', error);
    res.status(500).json({ error: 'Failed to manage seat' });
  }
});

// SeatSchedule management
router.get('/seat-schedules', isAdmin, async (req, res) => {
  try {
    const scheduleId = req.query.scheduleId ? parseInt(req.query.scheduleId as string) : undefined;
    
    const seatSchedules = await prisma.seatSchedule.findMany({
      where: scheduleId ? { scheduleId } : {},
      include: {
        seat: {
          include: {
            train: {
              select: {
                name: true,
                trainNumber: true
              }
            }
          }
        },
        schedule: {
          include: {
            train: true,
            fromStation: true,
            toStation: true
          }
        }
      }
    });
    
    res.json(seatSchedules);
  } catch (error) {
    console.error('Error fetching seat schedules:', error);
    res.status(500).json({ error: 'Failed to fetch seat schedules' });
  }
});

router.post('/seat-schedules', isAdmin, async (req, res) => {
  const { action, scheduleId, seatId, updates } = req.body;
  
  try {
    if (action === 'create') {
      // Create a seat schedule for a specific seat and schedule
      const newSeatSchedule = await prisma.seatSchedule.create({
        data: {
          scheduleId,
          seatId: seatId,
          price: updates.price || 0,
          isBooked: false
        }
      });
      
      res.json({ message: 'Seat schedule created successfully', seatSchedule: newSeatSchedule });
    } 
    else if (action === 'update') {
      // Update an existing seat schedule
      const updatedSeatSchedule = await prisma.seatSchedule.update({
        where: {
          id: updates.id
        },
        data: {
          price: updates.price,
          isBooked: updates.isBooked
        }
      });
      
      res.json({ message: 'Seat schedule updated successfully', seatSchedule: updatedSeatSchedule });
    } 
    else if (action === 'book') {
      // Book a seat in a schedule
      const bookedSeatSchedule = await prisma.seatSchedule.update({
        where: {
          id: updates.id
        },
        data: {
          isBooked: true
        }
      });
      
      res.json({ message: 'Seat booked successfully', seatSchedule: bookedSeatSchedule });
    } 
    else if (action === 'cancel') {
      // Cancel a booked seat
      const cancelledSeatSchedule = await prisma.seatSchedule.update({
        where: {
          id: updates.id
        },
        data: {
          isBooked: false
        }
      });
      
      res.json({ message: 'Seat booking cancelled successfully', seatSchedule: cancelledSeatSchedule });
    } 
    else if (action === 'create-bulk') {
      // Create seat schedules for all seats of a train
      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: { train: true }
      });
      
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      
      // Get all seats for the train
      const seats = await prisma.seat.findMany({
        where: {
          trainId: schedule.train.id,
          status: 'active'
        }
      });
      
      // Create a seat schedule for each seat
      const seatSchedules = await Promise.all(
        seats.map(seat => 
          prisma.seatSchedule.create({
            data: {
              scheduleId,
              seatId: seat.id,
              price: updates.priceMap?.[seat.seatClass] || 0,
              isBooked: false
            }
          })
        )
      );
      
      res.json({ 
        message: `Created ${seatSchedules.length} seat schedules successfully`, 
        count: seatSchedules.length 
      });
    } 
    else {
      res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error) {
    console.error('Error managing seat schedule:', error);
    res.status(500).json({ error: 'Failed to manage seat schedule' });
  }
});

// Stations management
router.get('/stations', isAdmin, async (req, res) => {
  try {
    const stations = await prisma.station.findMany();
    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// Berth management
router.post('/berths/manage', isAdmin, async (req, res) => {
  try {
    const { action, data } = req.body;
    
    if (action === 'create') {
      // Create a new berth
      const berth = await prisma.berth.create({
        data: {
          trainId: data.trainId,
          type: data.type,
          coachNumber: data.coachNumber,
          seatsPerCoach: data.seatsPerCoach,
          totalSeats: data.totalSeats,
          status: 'active'
        }
      });
      
      res.json({ message: 'Berth created successfully', berth });
    } 
    else if (action === 'update') {
      // Update an existing berth
      const berth = await prisma.berth.update({
        where: { 
          id: data.id 
        },
        data: {
          type: data.type,
          coachNumber: data.coachNumber,
          seatsPerCoach: data.seatsPerCoach,
          totalSeats: data.totalSeats,
          status: data.status
        }
      });
      
      res.json({ message: 'Berth updated successfully', berth });
    } 
    else if (action === 'delete') {
      // Check if there are any berth schedules for this berth
      const berthSchedules = await prisma.berthSchedule.findMany({
        where: { berthId: data.id }
      });
      
      if (berthSchedules.length > 0) {
        // Just mark as inactive instead of deleting
        await prisma.berth.update({
          where: { id: data.id },
          data: { status: 'inactive' }
        });
        
        res.json({ message: 'Berth marked as inactive (has schedules)' });
      } else {
        // Safe to delete
        await prisma.berth.delete({
          where: { id: data.id }
        });
        
        res.json({ message: 'Berth deleted successfully' });
      }
    } 
    else {
      res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error: any) {
    console.error('Error managing berth:', error);
    
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A berth with this coach number already exists for this train' });
    } else {
      res.status(500).json({ error: 'Failed to manage berth' });
    }
  }
});

// Get all berths
router.get('/berths', isAdmin, async (req, res) => {
  try {
    const berths = await prisma.berth.findMany({
      include: {
        train: {
          select: {
            id: true,
            name: true,
            trainNumber: true
          }
        }
      },
      orderBy: [
        { trainId: 'asc' },
        { coachNumber: 'asc' }
      ]
    });
    
    res.json(berths);
  } catch (error) {
    console.error('Error fetching berths:', error);
    res.status(500).json({ error: 'Failed to fetch berths' });
  }
});

// Berth schedule management
router.post('/berth-schedules/manage', isAdmin, async (req, res) => {
  try {
    const { action, scheduleId, data } = req.body;
    
    if (action === 'create') {
      // Create a new berth schedule
      const berthSchedule = await prisma.berthSchedule.create({
        data: {
          scheduleId,
          berthId: data.berthId,
          pricePerSeat: data.pricePerSeat,
          bookedSeats: '[]'
        }
      });
      
      res.json({ message: 'Berth schedule created successfully', berthSchedule });
    } 
    else if (action === 'update') {
      // Update an existing berth schedule
      const berthSchedule = await prisma.berthSchedule.update({
        where: { 
          id: data.id 
        },
        data: {
          pricePerSeat: data.pricePerSeat
        }
      });
      
      res.json({ message: 'Berth schedule updated successfully', berthSchedule });
    } 
    else if (action === 'delete') {
      // Check if there are any tickets for this berth schedule
      const tickets = await prisma.ticket.findMany({
        where: { berthScheduleId: data.id }
      });
      
      if (tickets.length > 0) {
        res.status(400).json({ error: 'Cannot delete berth schedule with existing tickets' });
      } else {
        // Safe to delete
        await prisma.berthSchedule.delete({
          where: { id: data.id }
        });
        
        res.json({ message: 'Berth schedule deleted successfully' });
      }
    }
    else if (action === 'create-bulk') {
      // Create berth schedules for multiple berths with pricing by berth type
      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId }
      });
      
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      
      // Get berths to schedule
      const berths = await prisma.berth.findMany({
        where: {
          id: { in: data.berthIds },
          status: 'active'
        }
      });
      
      if (berths.length === 0) {
        return res.status(400).json({ error: 'No valid berths selected' });
      }
      
      // Create a berth schedule for each berth with price from priceMap
      const results = await Promise.all(
        berths.map(berth => 
          prisma.berthSchedule.create({
            data: {
              scheduleId,
              berthId: berth.id,
              pricePerSeat: data.priceMap[berth.type] || 0,
              bookedSeats: '[]'
            }
          })
        )
      );
      
      // Update the available seats count in the schedule
      const totalNewSeats = berths.reduce((sum, berth) => sum + berth.totalSeats, 0);
      
      await prisma.schedule.update({
        where: { id: scheduleId },
        data: {
          availableSeats: {
            increment: totalNewSeats
          }
        }
      });
      
      res.json({ 
        message: `Created ${results.length} berth schedules successfully`, 
        count: results.length,
        totalSeats: totalNewSeats
      });
    }
    else {
      res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error: any) {
    console.error('Error managing berth schedule:', error);
    
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'This berth is already scheduled for this journey' });
    } else {
      res.status(500).json({ error: 'Failed to manage berth schedule' });
    }
  }
});

export default router; 