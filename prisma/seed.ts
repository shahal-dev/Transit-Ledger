import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Helper function to generate a random date within a range
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('Starting enhanced seed process...');
  
  // Get all existing trains
  const trains = await prisma.train.findMany();
  
  if (trains.length === 0) {
    console.log('No trains found in the database. Please create trains first.');
    return;
  }
  
  console.log(`Found ${trains.length} trains.`);
  
  // Clear existing seats to start fresh
  await prisma.seatSchedule.deleteMany({});
  await prisma.seat.deleteMany({});
  
  // Create enhanced seats for each train
  for (const train of trains) {
    console.log(`Processing train: ${train.name} (ID: ${train.id})`);
    
    // Define detailed seat classes with more information
    const seatClassDetails = [
      {
        name: 'economy',
        count: 30,
        carNumbers: [1, 2],
        basePrice: 50,
        features: {
          hasAC: false,
          hasPower: false,
          hasWifi: false,
          isReclining: false,
          hasFootrest: false,
          legRoom: 'standard',
          mealIncluded: false
        },
        description: 'Basic seating with standard amenities',
      },
      {
        name: 'business',
        count: 20,
        carNumbers: [3, 4],
        basePrice: 100,
        features: {
          hasAC: true,
          hasPower: true,
          hasWifi: true,
          isReclining: true,
          hasFootrest: false,
          legRoom: 'extended',
          mealIncluded: true
        },
        description: 'Comfortable seating with business amenities',
      },
      {
        name: 'first-class',
        count: 10,
        carNumbers: [5],
        basePrice: 150,
        features: {
          hasAC: true,
          hasPower: true,
          hasWifi: true,
          isReclining: true,
          hasFootrest: true,
          legRoom: 'premium',
          mealIncluded: true,
          personalAttendant: true
        },
        description: 'Premium seating with all luxury amenities',
      },
      {
        name: 'sleeper',
        count: 5,
        carNumbers: [6],
        basePrice: 75,
        features: {
          hasAC: true,
          hasPower: true,
          hasWifi: false,
          isReclining: true,
          hasFootrest: true,
          bedding: true,
          mealIncluded: false
        },
        description: 'Sleeping berths for overnight journeys',
      }
    ];
    
    // Create seats for each class
    for (const seatClass of seatClassDetails) {
      console.log(`Creating ${seatClass.count} ${seatClass.name} seats for train ${train.id}...`);
      
      // Distribute seats across car numbers
      const seatsPerCar = Math.ceil(seatClass.count / seatClass.carNumbers.length);
      
      let seatCounter = 0;
      
      for (const carNumber of seatClass.carNumbers) {
        // Calculate seats for this car
        const seatsInThisCar = Math.min(seatsPerCar, seatClass.count - seatCounter);
        
        // Create seats for this car
        const seatData = Array.from({ length: seatsInThisCar }, (_, i) => {
          seatCounter++;
          
          // Create letter-number format (e.g., A1, B2)
          const row = Math.floor(i / 4) + 1;
          const column = ['A', 'B', 'C', 'D'][i % 4];
          const seatNumber = `${column}${row}`;
          
          const position = i % 4 === 0 || i % 4 === 3 ? 'window' : 
                          i % 4 === 1 || i % 4 === 2 ? 'aisle' : 'middle';
          
          return {
            trainId: train.id,
            seatNumber,
            seatClass: seatClass.name,
            carNumber,
            position,
            features: seatClass.features,
            status: 'active',
          };
        });
        
        // Batch create seats
        await prisma.seat.createMany({
          data: seatData,
        });
      }
    }
    
    console.log(`Created enhanced seats for train ${train.id}`);
  }
  
  // Get all schedules
  const schedules = await prisma.schedule.findMany();
  
  if (schedules.length === 0) {
    console.log('No schedules found in the database. Please create schedules first.');
    return;
  }
  
  console.log(`Found ${schedules.length} schedules.`);
  
  // Create seat schedules for each schedule with varying prices
  for (const schedule of schedules) {
    console.log(`Processing schedule ID: ${schedule.id}`);
    
    // Get the train for this schedule
    const train = await prisma.train.findUnique({
      where: { id: schedule.trainId }
    });
    
    if (!train) {
      console.log(`Train not found for schedule ${schedule.id}. Skipping.`);
      continue;
    }
    
    // Get all seats for this train
    const seats = await prisma.seat.findMany({
      where: { 
        trainId: train.id,
        status: 'active'
      }
    });
    
    if (seats.length === 0) {
      console.log(`No seats found for train ${train.id}. Skipping.`);
      continue;
    }
    
    console.log(`Creating seat schedules for ${seats.length} seats in schedule ${schedule.id}...`);
    
    // Define base pricing by seat class
    const basePricing = {
      'economy': 50,
      'business': 100,
      'first-class': 150,
      'sleeper': 75
    };
    
    // Add price variation based on schedule (peak hours, weekends, etc.)
    const journeyDate = new Date(schedule.journeyDate);
    const isWeekend = journeyDate.getDay() === 0 || journeyDate.getDay() === 6;
    const priceMultiplier = isWeekend ? 1.2 : 1.0;  // 20% more expensive on weekends
    
    // Create seat schedules with varying prices
    const seatSchedulesData = seats.map(seat => {
      const basePrice = basePricing[seat.seatClass as keyof typeof basePricing] || 50;
      // Add some randomness to price (±10%)
      const randomFactor = 0.9 + (Math.random() * 0.2);
      const calculatedPrice = Math.round(basePrice * priceMultiplier * randomFactor);
      
      return {
        scheduleId: schedule.id,
        seatId: seat.id,
        price: calculatedPrice,
        isBooked: false
      };
    });
    
    // Batch create seat schedules
    await prisma.seatSchedule.createMany({
      data: seatSchedulesData,
    });
    
    console.log(`Created ${seatSchedulesData.length} seat schedules for schedule ${schedule.id}`);
    
    // Mark some seats as booked randomly (about 20-30% of seats)
    const seatSchedules = await prisma.seatSchedule.findMany({
      where: { scheduleId: schedule.id }
    });
    
    // Randomly select 20-30% of seat schedules to mark as booked
    const bookingCount = Math.floor(seatSchedules.length * (0.2 + Math.random() * 0.1));
    const schedulesToBook = seatSchedules
      .sort(() => 0.5 - Math.random()) // Shuffle array
      .slice(0, bookingCount);
    
    if (schedulesToBook.length > 0) {
      for (const seatSchedule of schedulesToBook) {
        await prisma.seatSchedule.update({
          where: { id: seatSchedule.id },
          data: { isBooked: true }
        });
      }
      
      console.log(`Marked ${bookingCount} seats as booked for schedule ${schedule.id}`);
    }
  }
  
  // Create sample users if none exist
  const usersCount = await prisma.user.count();
  
  if (usersCount === 0) {
    console.log('Creating sample users...');
    // Create 5 sample users
    const users = [
      {
        username: 'alice',
        password: '$2b$10$BnH9h2UrqUjVFqRl.RjU6uiF3UrVUjBR9z3AqK7ZnqZNjrNQnFwX6', // hashed 'password'
        fullName: 'Alice Johnson',
        nidHash: crypto.randomBytes(16).toString('hex'),
        phone: '01711234567',
        email: 'alice@example.com',
        verified: true,
        isAdmin: false
      },
      {
        username: 'bob',
        password: '$2b$10$BnH9h2UrqUjVFqRl.RjU6uiF3UrVUjBR9z3AqK7ZnqZNjrNQnFwX6', // hashed 'password'
        fullName: 'Bob Smith',
        nidHash: crypto.randomBytes(16).toString('hex'),
        phone: '01812345678',
        email: 'bob@example.com',
        verified: true,
        isAdmin: false
      },
      {
        username: 'charlie',
        password: '$2b$10$BnH9h2UrqUjVFqRl.RjU6uiF3UrVUjBR9z3AqK7ZnqZNjrNQnFwX6', // hashed 'password'
        fullName: 'Charlie Brown',
        nidHash: crypto.randomBytes(16).toString('hex'),
        phone: '01913456789',
        email: 'charlie@example.com',
        verified: true,
        isAdmin: false
      },
      {
        username: 'admin',
        password: '$2b$10$BnH9h2UrqUjVFqRl.RjU6uiF3UrVUjBR9z3AqK7ZnqZNjrNQnFwX6', // hashed 'password'
        fullName: 'Admin User',
        nidHash: crypto.randomBytes(16).toString('hex'),
        phone: '01600000000',
        email: 'admin@example.com',
        verified: true,
        isAdmin: true
      },
      {
        username: 'operator',
        password: '$2b$10$BnH9h2UrqUjVFqRl.RjU6uiF3UrVUjBR9z3AqK7ZnqZNjrNQnFwX6', // hashed 'password'
        fullName: 'Operator User',
        nidHash: crypto.randomBytes(16).toString('hex'),
        phone: '01700000000',
        email: 'operator@example.com',
        verified: true,
        isAdmin: false
      }
    ];
    
    for (const user of users) {
      await prisma.user.upsert({
        where: { username: user.username },
        update: {},
        create: user
      });
    }
    
    console.log('Created 5 sample users');
  }
  
  // Create sample tickets for demonstration
  console.log('Creating sample tickets...');
  
  // Delete all existing tickets first
  console.log('Cleaning up existing tickets...');
  await prisma.ticket.deleteMany({});
  console.log('All existing tickets removed.');
  
  // First, get all booked seat schedules
  const bookedSeatSchedules = await prisma.seatSchedule.findMany({
    where: { isBooked: true },
    include: {
      schedule: true,
      seat: true
    }
  });
  
  // Get normal user IDs for ticket creation
  const users = await prisma.user.findMany({
    where: { isAdmin: false }
  });
  
  if (users.length === 0) {
    console.log('No users found. Skipping ticket creation.');
  } else {
    // Create tickets for each booked seat schedule
    let ticketCounter = 0;
    
    // Track active tickets per user
    const userActiveTickets = new Map<number, boolean>();
    
    // Sort seat schedules by journey date - older ones first
    bookedSeatSchedules.sort((a, b) => {
      const dateA = new Date(a.schedule.journeyDate);
      const dateB = new Date(b.schedule.journeyDate);
      return dateA.getTime() - dateB.getTime();
    });
    
    for (const seatSchedule of bookedSeatSchedules) {
      // Choose a random user
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      // Create random dates
      const now = new Date();
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(now.getDate() - 14);
      
      const issuedAt = randomDate(oneMonthAgo, twoWeeksAgo);
      
      // Determine if this is a past, current or future journey
      const journeyDate = new Date(seatSchedule.schedule.journeyDate);
      const isPastJourney = journeyDate < now;
      
      // Check if user already has an active ticket
      const hasActiveTicket = userActiveTickets.get(randomUser.id) || false;
      
      // Determine ticket status
      // For past journeys: 90% used, 10% cancelled
      // For future journeys: If user already has active ticket, this should be cancelled
      //                      Otherwise, 80% confirmed, 20% pending payment
      
      let status, paymentStatus;
      
      if (isPastJourney) {
        // Past journey
        if (Math.random() < 0.9) {
          status = "used";
          paymentStatus = "completed";
        } else {
          status = "cancelled";
          paymentStatus = "cancelled";
        }
      } else {
        // Future journey
        if (hasActiveTicket) {
          // User already has an active ticket - make this one cancelled
          status = "cancelled";
          paymentStatus = "cancelled";
        } else {
          // This will be the user's active ticket
          if (Math.random() < 0.8) {
            status = "confirmed";
            paymentStatus = "completed";
            // Mark user as having an active ticket
            userActiveTickets.set(randomUser.id, true);
          } else {
            status = "booked";
            paymentStatus = "pending";
            // pending tickets don't count as active yet
          }
        }
      }
      
      // Generate unique hashes
      const ticketHash = crypto.randomBytes(16).toString('hex');
      const qrCode = `TL-${seatSchedule.scheduleId}-${randomUser.id}-${ticketHash.substring(0, 8)}`;
      
      // Create ticket
      try {
        await prisma.ticket.create({
          data: {
            userId: randomUser.id,
            scheduleId: seatSchedule.scheduleId,
            seatNumber: seatSchedule.seat.seatNumber,
            seatScheduleId: seatSchedule.id,
            paymentId: paymentStatus === 'completed' ? `PAY-${crypto.randomBytes(8).toString('hex')}` : null,
            paymentStatus,
            ticketHash,
            qrCode,
            price: seatSchedule.price,
            issuedAt,
            status,
            metadata: {
              seatClass: seatSchedule.seat.seatClass,
              carNumber: seatSchedule.seat.carNumber,
              position: seatSchedule.seat.position,
              seatFeatures: seatSchedule.seat.features
            }
          }
        });
        
        ticketCounter++;
      } catch (error) {
        console.log(`Error creating ticket for seat schedule ${seatSchedule.id}: ${error}`);
      }
    }
    
    console.log(`Created ${ticketCounter} sample tickets`);
  }
  
  console.log('Enhanced seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 