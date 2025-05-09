import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  try {
    // Admin user details
    const adminUser = {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10), // Default password, should be changed
      fullName: 'System Administrator',
      nidHash: crypto.createHash('sha256').update('ADMIN_NID').digest('hex'),
      phone: '01XXXXXXXXX',
      email: 'admin@transitledger.com',
      verified: true,
      isAdmin: true,
    };

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: adminUser.username },
    });

    if (existingAdmin) {
      // Update admin if already exists
      const updatedAdmin = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          isAdmin: true,
          verified: true,
        },
      });
      console.log('Admin user updated:', updatedAdmin);
    } else {
      // Create new admin user
      const newAdmin = await prisma.user.create({
        data: adminUser,
      });

      // Create wallet for admin
      await prisma.wallet.create({
        data: {
          userId: newAdmin.id,
          balance: 1000, // Initial balance
        },
      });

      console.log('Admin user created:', newAdmin);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 