import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      fullName: 'Admin User',
      nidHash: 'admin-nid-hash',
      phone: '1234567890',
      email: 'admin@example.com',
      verified: true,
    },
  });

  // Create a sample train
  const train = await prisma.train.upsert({
    where: { trainNumber: 'T001' },
    update: {},
    create: {
      name: 'Express Train',
      trainNumber: 'T001',
      fromStation: 'Dhaka',
      toStation: 'Chittagong',
      departureTime: '08:00',
      arrivalTime: '14:00',
      duration: '6h',
      type: 'AC',
      totalSeats: 100,
      availableSeats: 100,
      status: 'active',
    },
  });

  console.log({ admin, train });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 