// This script seeds the database with sample trains
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding trains...');

  // Get list of stations to associate trains with
  const stations = await prisma.station.findMany();
  if (stations.length === 0) {
    console.log('No stations found. Please run seed-stations.js first.');
    return;
  }

  // Define trains
  const trainsData = [
    {
      name: "Padma Express",
      trainNumber: "PE-101",
      fromStation: "Dhaka Central",
      toStation: "Chittagong Junction",
      departureTime: "08:00",
      arrivalTime: "14:00",
      duration: "6h",
      type: "Express",
      totalSeats: 500,
      availableSeats: 500,
      status: "active",
      stationId: stations[0].id // Dhaka Central
    },
    {
      name: "Silk City Express",
      trainNumber: "SC-203",
      fromStation: "Dhaka Central",
      toStation: "Rajshahi Central",
      departureTime: "09:30",
      arrivalTime: "15:30",
      duration: "6h",
      type: "Express",
      totalSeats: 450,
      availableSeats: 450,
      status: "active",
      stationId: stations[0].id // Dhaka Central
    },
    {
      name: "Mohanagar Express",
      trainNumber: "ME-305",
      fromStation: "Chittagong Junction",
      toStation: "Sylhet Terminal",
      departureTime: "07:15",
      arrivalTime: "14:45",
      duration: "7h 30m",
      type: "Express",
      totalSeats: 400,
      availableSeats: 400,
      status: "active",
      stationId: stations[1].id // Chittagong Junction
    },
    {
      name: "Khulna Mail",
      trainNumber: "KM-408",
      fromStation: "Dhaka Central",
      toStation: "Khulna Station",
      departureTime: "10:00",
      arrivalTime: "16:30",
      duration: "6h 30m",
      type: "Mail",
      totalSeats: 350,
      availableSeats: 350,
      status: "maintenance",
      stationId: stations[3].id // Khulna Station
    }
  ];

  // Insert trains
  for (const trainData of trainsData) {
    const existingTrain = await prisma.train.findFirst({
      where: { trainNumber: trainData.trainNumber }
    });

    if (!existingTrain) {
      await prisma.train.create({
        data: trainData
      });
    }
  }

  // Get the created trains
  const trains = await prisma.train.findMany();
  console.log(`Seeded ${trains.length} trains`);

  // Create schedules for each active train
  for (const train of trains) {
    if (train.status === 'active') {
      // Create schedules for the next 7 days
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const scheduleDate = new Date(today);
        scheduleDate.setDate(today.getDate() + i);

        // Format date as YYYY-MM-DD
        const formattedDate = scheduleDate.toISOString().split('T')[0];

        // Check if schedule already exists
        const existingSchedule = await prisma.schedule.findFirst({
          where: {
            trainId: train.id,
            journeyDate: formattedDate
          }
        });

        if (!existingSchedule) {
          await prisma.schedule.create({
            data: {
              trainId: train.id,
              journeyDate: formattedDate,
              availableSeats: train.totalSeats,
              status: 'scheduled'
            }
          });
        }
      }
    }
  }

  const scheduleCount = await prisma.schedule.count();
  console.log(`Seeded ${scheduleCount} schedules`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 