import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to generate a random date within a range
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('Starting enhanced seed process...');
  
  // Create sample admin user first
  console.log('Creating admin user...');
  const adminPassword = 'admin123';
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'Admin User',
      nidHash: crypto.randomBytes(16).toString('hex'),
      phone: '01600000000',
      email: 'admin@example.com',
      verified: true,
      isAdmin: true
    }
  });
  
  console.log('Admin user created with username: admin, password: admin123');
  
  // Create sample users if none exist
  const usersCount = await prisma.user.count();
  
  if (usersCount <= 1) {
    console.log('Creating sample users...');
    // Create 5 sample users
    const regularPassword = await bcrypt.hash('password', saltRounds);
    const users = [
      {
        username: 'alice',
        password: regularPassword,
        fullName: 'Alice Johnson',
        nidHash: crypto.randomBytes(16).toString('hex'),
        phone: '01711234567',
        email: 'alice@example.com',
        verified: true,
        isAdmin: false
      },
      {
        username: 'bob',
        password: regularPassword,
        fullName: 'Bob Smith',
        nidHash: crypto.randomBytes(16).toString('hex'),
        phone: '01812345678',
        email: 'bob@example.com',
        verified: true,
        isAdmin: false
      },
      {
        username: 'charlie',
        password: regularPassword,
        fullName: 'Charlie Brown',
        nidHash: crypto.randomBytes(16).toString('hex'),
        phone: '01913456789',
        email: 'charlie@example.com',
        verified: true,
        isAdmin: false
      },
      {
        username: 'operator',
        password: regularPassword,
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
    
    console.log('Created 4 additional sample users');
  }
  
  // Create sample stations if none exist
  const stationsCount = await prisma.station.count();
  
  if (stationsCount === 0) {
    console.log('Creating sample stations...');
    const stationsData = [
      { name: 'Dhaka Central', city: 'Dhaka', platforms: 5, status: 'operational' },
      { name: 'Chittagong Terminal', city: 'Chittagong', platforms: 4, status: 'operational' },
      { name: 'Sylhet Junction', city: 'Sylhet', platforms: 3, status: 'operational' },
      { name: 'Rajshahi Station', city: 'Rajshahi', platforms: 2, status: 'operational' },
      { name: 'Khulna Central', city: 'Khulna', platforms: 3, status: 'operational' },
      { name: 'Barisal Station', city: 'Barisal', platforms: 2, status: 'operational' }
    ];
    
    await prisma.station.createMany({
      data: stationsData
    });
    
    console.log(`Created ${stationsData.length} stations`);
  }
  
  // Create sample trains if none exist
  const trainsCount = await prisma.train.count();
  
  if (trainsCount === 0) {
    console.log('Creating sample trains...');
    const trainsData = [
      { name: 'Dhaka Express', trainNumber: 'DE101', type: 'express' },
      { name: 'Chittagong Mail', trainNumber: 'CM201', type: 'mail' },
      { name: 'Sylhet Commuter', trainNumber: 'SC301', type: 'commuter' },
      { name: 'Rajshahi Express', trainNumber: 'RE401', type: 'express' },
      { name: 'Khulna Intercity', trainNumber: 'KI501', type: 'intercity' }
    ];
    
    await prisma.train.createMany({
      data: trainsData
    });
    
    console.log(`Created ${trainsData.length} trains`);
  }
  
  // Get all trains
  const trains = await prisma.train.findMany();
  console.log(`Found ${trains.length} trains.`);
  
  // Create enhanced seats for each train if none exist
  const seatsCount = await prisma.seat.count();
  
  if (seatsCount === 0) {
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
  }
  
  // Create sample schedules if none exist
  const schedulesCount = await prisma.schedule.count();
  
  if (schedulesCount === 0) {
    console.log('Creating sample schedules...');
    
    // Get all stations
    const stations = await prisma.station.findMany();
    
    // Create schedules for each train
    const now = new Date();
    const scheduleData = [];
    
    for (const train of trains) {
      // Create 5 schedules for each train with varying dates
      for (let i = 0; i < 5; i++) {
        // Select random from and to stations (must be different)
        let fromStationIndex = Math.floor(Math.random() * stations.length);
        let toStationIndex = Math.floor(Math.random() * stations.length);
        
        // Make sure from and to stations are different
        while (fromStationIndex === toStationIndex) {
          toStationIndex = Math.floor(Math.random() * stations.length);
        }
        
        const fromStation = stations[fromStationIndex];
        const toStation = stations[toStationIndex];
        
        // Generate random departure date (between today and 30 days from now)
        const departureDate = new Date(now);
        departureDate.setDate(now.getDate() + Math.floor(Math.random() * 30));
        
        // Set random hour for departure (between 6 AM and 10 PM)
        departureDate.setHours(6 + Math.floor(Math.random() * 16), Math.floor(Math.random() * 60), 0, 0);
        
        // Calculate arrival time (2-6 hours after departure)
        const arrivalDate = new Date(departureDate);
        arrivalDate.setHours(arrivalDate.getHours() + 2 + Math.floor(Math.random() * 4));
        
        // Format journey date as YYYY-MM-DD
        const journeyDate = departureDate.toISOString().split('T')[0];
        
        // Random available seats (between 50 and 100)
        const availableSeats = 50 + Math.floor(Math.random() * 51);
        
        scheduleData.push({
          trainId: train.id,
          fromStationId: fromStation.id,
          toStationId: toStation.id,
          departureTime: departureDate,
          arrivalTime: arrivalDate,
          journeyDate,
          availableSeats,
          status: 'scheduled'
        });
      }
    }
    
    await prisma.schedule.createMany({
      data: scheduleData
    });
    
    console.log(`Created ${scheduleData.length} schedules`);
  }
  
  // Get all schedules
  const schedules = await prisma.schedule.findMany();
  console.log(`Found ${schedules.length} schedules.`);
  
  // Create seat schedules for each schedule if none exist
  const seatSchedulesCount = await prisma.seatSchedule.count();
  
  if (seatSchedulesCount === 0) {
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
  }
  
  // Create wallets for users if they don't have one
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    });
    
    if (!wallet) {
      await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: Math.floor(Math.random() * 1000) + 500 // Random balance between 500 and 1500
        }
      });
      console.log(`Created wallet for user ${user.username}`);
    }
  }
  
  // Create sample tickets if none exist
  const ticketsCount = await prisma.ticket.count();
  
  if (ticketsCount === 0) {
    console.log('Creating sample tickets...');
    
    // Get all booked seat schedules
    const bookedSeatSchedules = await prisma.seatSchedule.findMany({
      where: { isBooked: true },
      include: {
        schedule: true,
        seat: true
      }
    });
    
    // Get normal user IDs for ticket creation
    const regularUsers = await prisma.user.findMany({
      where: { isAdmin: false }
    });
    
    if (regularUsers.length === 0) {
      console.log('No regular users found. Skipping ticket creation.');
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
        const randomUser = regularUsers[Math.floor(Math.random() * regularUsers.length)];
        
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
  }
  
  // Create berths for trains if none exist
  const berthsCount = await prisma.berth.count();
  
  if (berthsCount === 0) {
    console.log('Creating sample berths...');
    
    // Define Bangladesh railway coach types
    const coachTypes = [
      { type: 'Ac_b', name: 'AC Berth', seats: 80 },
      { type: 'AC_s', name: 'AC Seat', seats: 80 },
      { type: 'Snigdha', name: 'Snigdha', seats: 80 },
      { type: 'F_berth', name: 'First Berth', seats: 80 },
      { type: 'F_seat', name: 'First Seat', seats: 80 },
      { type: 'F_chair', name: 'First Chair', seats: 80 },
      { type: 'S_chair', name: 'Second Chair', seats: 80 },
      { type: 'Shovon', name: 'Shovon', seats: 80 },
      { type: 'Shulov', name: 'Shulov', seats: 80 },
      { type: 'Ac_chair', name: 'AC Chair', seats: 80 }
    ];
    
    // Get all trains
    const trains = await prisma.train.findMany({
      where: { status: 'active' }
    });
    
    // Create berths for each train
    for (const train of trains) {
      // Assign random coach types to each train (3-5 coach types per train)
      const trainCoachTypes = [...coachTypes]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 3);
      
      // For each coach type, create 1-3 coaches
      for (const coachType of trainCoachTypes) {
        const coachCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 1; i <= coachCount; i++) {
          await prisma.berth.create({
            data: {
              trainId: train.id,
              type: coachType.type,
              coachNumber: i,
              seatsPerCoach: coachType.seats,
              totalSeats: coachType.seats,
              status: 'active'
            }
          });
          
          console.log(`Created ${coachType.name} coach #${i} for train ${train.name}`);
        }
      }
    }
  }
  
  // Create berth schedules for each schedule
  const berthSchedulesCount = await prisma.berthSchedule.count();
  
  if (berthSchedulesCount === 0) {
    console.log('Creating sample berth schedules...');
    
    // Get all schedules
    const schedules = await prisma.schedule.findMany({
      where: { status: 'scheduled' }
    });
    
    // Base pricing by coach type
    const basePricing: Record<string, number> = {
      'Ac_b': 600,
      'AC_s': 550,
      'Ac_chair': 500,
      'F_berth': 450,
      'F_seat': 400,
      'F_chair': 350,
      'Snigdha': 400,
      'S_chair': 300,
      'Shovon': 250,
      'Shulov': 200
    };
    
    // Process each schedule
    for (const schedule of schedules) {
      console.log(`Processing schedule ID: ${schedule.id} for berth schedules`);
      
      // Get the train for this schedule
      const train = await prisma.train.findUnique({
        where: { id: schedule.trainId }
      });
      
      if (!train) {
        console.log(`Train not found for schedule ${schedule.id}. Skipping.`);
        continue;
      }
      
      // Get all berths for this train
      const berths = await prisma.berth.findMany({
        where: { 
          trainId: train.id,
          status: 'active'
        }
      });
      
      if (berths.length === 0) {
        console.log(`No berths found for train ${train.id}. Skipping.`);
        continue;
      }
      
      console.log(`Creating berth schedules for ${berths.length} berths in schedule ${schedule.id}...`);
      
      // Add price variation based on schedule (peak hours, weekends, etc.)
      const journeyDate = new Date(schedule.journeyDate);
      const isWeekend = journeyDate.getDay() === 0 || journeyDate.getDay() === 6;
      const priceMultiplier = isWeekend ? 1.2 : 1.0;  // 20% more expensive on weekends
      
      // Create berth schedules
      for (const berth of berths) {
        const basePrice = basePricing[berth.type] || 200;
        // Add some randomness to price (±10%)
        const randomFactor = 0.9 + (Math.random() * 0.2);
        const calculatedPrice = Math.round(basePrice * priceMultiplier * randomFactor);
        
        // Create berth schedule
        const berthSchedule = await prisma.berthSchedule.create({
          data: {
            scheduleId: schedule.id,
            berthId: berth.id,
            pricePerSeat: calculatedPrice,
            bookedSeats: '[]'
          }
        });
        
        // Book 10-30% of seats randomly
        const seatCount = berth.totalSeats;
        const bookingCount = Math.floor(seatCount * (0.1 + Math.random() * 0.2));
        
        if (bookingCount > 0) {
          // Generate unique random seat numbers (A1-D20)
          const allPossibleSeats = [];
          for (let row = 1; row <= 20; row++) {
            for (const col of ['A', 'B', 'C', 'D']) {
              allPossibleSeats.push(`${col}${row}`);
            }
          }
          
          // Shuffle and take a subset
          const bookedSeats = allPossibleSeats
            .sort(() => 0.5 - Math.random())
            .slice(0, bookingCount);
          
          // Update berth schedule with booked seats
          await prisma.berthSchedule.update({
            where: { id: berthSchedule.id },
            data: { 
              bookedSeats: JSON.stringify(bookedSeats)
            }
          });
          
          console.log(`Marked ${bookingCount} seats as booked for berth schedule ${berthSchedule.id}`);
        }
      }
      
      // Update the total available seats in the schedule
      const totalSeats = berths.reduce((sum, berth) => sum + berth.totalSeats, 0);
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          availableSeats: totalSeats
        }
      });
      
      console.log(`Updated schedule ${schedule.id} with ${totalSeats} available seats from berths`);
    }
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