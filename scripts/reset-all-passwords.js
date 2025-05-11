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

async function resetAllPasswords() {
  try {
    console.log('Resetting all user passwords...');
    
    // Find all users
    const users = await prisma.user.findMany();
    
    if (users.length === 0) {
      console.log('No users found!');
      return;
    }
    
    console.log(`Found ${users.length} users. Resetting passwords...`);
    
    // For each user: admin gets "admin123", others get "password"
    for (const user of users) {
      const passwordToUse = user.username === 'admin' ? 'admin123' : 'password';
      const hashedPassword = await hashPassword(passwordToUse);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      
      console.log(`Reset password for user: ${user.username}`);
    }
    
    console.log('All passwords have been reset successfully!');
    console.log('- Admin user: admin123');
    console.log('- Regular users: password');
  } catch (error) {
    console.error('Error resetting passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAllPasswords(); 