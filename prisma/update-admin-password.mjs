import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import util from 'util';

const prisma = new PrismaClient();
const scryptAsync = util.promisify(crypto.scrypt);

// Hash a password using the same method as in server/auth.ts
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  try {
    // Admin credentials - same as the original admin
    const username = 'admin';
    const plainPassword = 'admin123';
    
    // Hash the password using the server's method
    const hashedPassword = await hashPassword(plainPassword);
    
    // Find the admin user
    const admin = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!admin) {
      console.error('Admin user not found');
      return;
    }
    
    // Update the admin's password
    const updatedAdmin = await prisma.user.update({
      where: { id: admin.id },
      data: { 
        password: hashedPassword,
        isAdmin: true,
        verified: true
      }
    });
    
    console.log('Admin password updated successfully');
    console.log(`Admin username: ${updatedAdmin.username}`);
    console.log(`Plain password: ${plainPassword}`);
    console.log('Use these credentials to log in to the admin panel');
    
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 