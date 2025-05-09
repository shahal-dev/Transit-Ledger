// This script seeds the database with initial stations
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding stations...');

  // Remove existing stations first to avoid duplicates
  await prisma.station.deleteMany({});

  // Define stations
  const stationsData = [
    {
      name: "Dhaka Central",
      city: "Dhaka",
      status: "operational",
      platforms: 6,
    },
    {
      name: "Chittagong Junction",
      city: "Chittagong",
      status: "operational",
      platforms: 4,
    },
    {
      name: "Sylhet Terminal",
      city: "Sylhet",
      status: "maintenance",
      platforms: 3,
    },
    {
      name: "Khulna Station",
      city: "Khulna",
      status: "operational",
      platforms: 3,
    },
    {
      name: "Rajshahi Central",
      city: "Rajshahi",
      status: "operational",
      platforms: 2,
    }
  ];

  // Insert stations
  for (const stationData of stationsData) {
    await prisma.station.create({
      data: stationData
    });
  }

  const stationCount = await prisma.station.count();
  console.log(`Seeded ${stationCount} stations`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 