import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { promisify } from 'util';

const prisma = new PrismaClient();
const scryptAsync = promisify(crypto.scrypt);

// Hash a password for storage - identical to the one in auth.ts
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (!adminUser) {
      console.log('Admin user not found!');
      return;
    }
    
    // Hash the password with our method
    const hashedPassword = await hashPassword('admin123');
    
    // Update the admin user with the new password
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    });
    
    console.log('Admin password has been reset to "admin123" successfully!');
    console.log('The properly hashed password is now in the database.');
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword(); 