#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('\n=== Transit Ledger Admin Creation ===\n');

    const username = await question('Username (default: admin): ') || 'admin';
    const tempPassword = await question('Password (default: admin123): ') || 'admin123';
    const fullName = await question('Full Name (default: System Administrator): ') || 'System Administrator';
    const phone = await question('Phone Number (default: 01XXXXXXXXX): ') || '01XXXXXXXXX';
    const email = await question('Email (default: admin@transitledger.com): ') || 'admin@transitledger.com';
    
    // Hash the password
    const password = await bcrypt.hash(tempPassword, 10);
    
    // Generate NID hash
    const nidValue = await question('NID Number (will be hashed, default: ADMIN_NID): ') || 'ADMIN_NID';
    const nidHash = crypto.createHash('sha256').update(nidValue).digest('hex');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username },
    });

    if (existingAdmin) {
      console.log(`\nUser with username '${username}' already exists.`);
      const update = await question('Do you want to update this user to make them an admin? (y/n): ');
      
      if (update.toLowerCase() === 'y') {
        // Update existing user to make them an admin
        const updatedAdmin = await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            password, // Update password if provided
            isAdmin: true,
            verified: true,
          },
        });
        console.log('\nUser updated to admin:', updatedAdmin);
      } else {
        console.log('\nNo changes made.');
      }
    } else {
      // Create new admin user
      const adminUser = {
        username,
        password,
        fullName,
        nidHash,
        phone,
        email,
        verified: true,
        isAdmin: true,
      };
      
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

      console.log('\nAdmin user created successfully:');
      console.log({
        id: newAdmin.id,
        username: newAdmin.username,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        isAdmin: newAdmin.isAdmin,
      });
      console.log('\nNote: Save this password in a secure location!');
      console.log(`Password: ${tempPassword}`);
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// List all admin users
async function listAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        verified: true,
        createdAt: true,
      },
    });

    console.log('\n=== Transit Ledger Admin Users ===\n');
    if (admins.length === 0) {
      console.log('No admin users found.');
    } else {
      admins.forEach(admin => {
        console.log(`ID: ${admin.id}`);
        console.log(`Username: ${admin.username}`);
        console.log(`Name: ${admin.fullName}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Verified: ${admin.verified}`);
        console.log(`Created: ${admin.createdAt}`);
        console.log('------------------------');
      });
    }
  } catch (error) {
    console.error('Error listing admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  if (command === 'list') {
    await listAdmins();
  } else if (command === 'create') {
    await createAdmin();
  } else {
    console.log('\nTransit Ledger Admin Management Tool');
    console.log('-----------------------------------');
    console.log('Available commands:');
    console.log('  create  - Create a new admin user');
    console.log('  list    - List all admin users');
    console.log('\nUsage: node scripts/admin-setup.mjs [command]\n');
  }
}

main(); 