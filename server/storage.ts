import dotenv from "dotenv";
dotenv.config();

import { PrismaClient, type User, type Verification, type Wallet, type Transaction, type Train, type Schedule, type Ticket, type TicketVerification, type EmailVerification } from '@prisma/client';
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import prisma from "./prisma-client";

const PgSession = connectPgSimple(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByNidHash(nidHash: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  verifyUser(userId: number): Promise<User>;
  deleteUser(userId: number): Promise<void>;

  // Verification operations
  getVerification(id: number): Promise<Verification | undefined>;
  getVerificationByUserId(userId: number): Promise<Verification | undefined>;
  createVerification(verification: Omit<Verification, 'id' | 'createdAt'>): Promise<Verification>;
  updateVerificationStatus(id: number, status: string): Promise<Verification>;

  // Wallet operations
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletByUserId(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: Omit<Wallet, 'id' | 'createdAt' | 'balance'>): Promise<Wallet>;
  updateWalletBalance(id: number, amount: number): Promise<Wallet>;

  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByWalletId(walletId: number): Promise<Transaction[]>;
  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;

  // Train operations
  getTrain(id: number): Promise<Train | undefined>;
  getTrainByNumber(trainNumber: string): Promise<Train | undefined>;
  getAllTrains(): Promise<Train[]>;
  createTrain(train: Omit<Train, 'id'>): Promise<Train>;
  updateTrainAvailableSeats(id: number, seats: number): Promise<Train>;

  // Schedule operations
  getSchedule(id: number): Promise<Schedule | undefined>;
  getSchedulesByTrainId(trainId: number): Promise<Schedule[]>;
  getAllSchedules(): Promise<Schedule[]>;
  getSchedulesByJourneyDate(date: string): Promise<Schedule[]>;
  createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt'>): Promise<Schedule>;
  updateScheduleAvailableSeats(id: number, seats: number): Promise<Schedule>;

  // Ticket operations
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketsByUserId(userId: number): Promise<Ticket[]>;
  getTicketByHash(hash: string): Promise<Ticket | undefined>;
  getTicketsByScheduleId(scheduleId: number): Promise<Ticket[]>;
  createTicket(ticket: Omit<Ticket, 'id' | 'issuedAt'>): Promise<Ticket>;
  updateTicketStatus(id: number, status: string): Promise<Ticket>;
  updateTicketPaymentStatus(id: number, status: string, paymentId: string): Promise<Ticket>;

  // Ticket verification operations
  getTicketVerification(id: number): Promise<TicketVerification | undefined>;
  getTicketVerificationsByTicketId(ticketId: number): Promise<TicketVerification[]>;
  createTicketVerification(verification: Omit<TicketVerification, 'id' | 'verifiedAt'>): Promise<TicketVerification>;

  // Email verification operations
  createEmailVerification(userId: number, email: string, verificationCode: string, expiresAt: Date): Promise<EmailVerification>;
  getEmailVerification(userId: number): Promise<EmailVerification | undefined>;
  verifyEmail(userId: number): Promise<EmailVerification>;

  // Session store
  sessionStore: session.Store;
}

// Database storage implementation
export class DbStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PgSession({
      pool: prisma.$pool,
      tableName: 'session'
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return await prisma.user.findUnique({ where: { id } });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await prisma.user.findUnique({ where: { username } });
  }

  async getUserByNidHash(nidHash: string): Promise<User | undefined> {
    return await prisma.user.findFirst({ where: { nidHash } });
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return await prisma.user.create({ data: user });
  }

  async verifyUser(userId: number): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { verified: true }
    });
  }

  async deleteUser(userId: number): Promise<void> {
    await prisma.$transaction([
      prisma.emailVerification.deleteMany({ where: { userId } }),
      prisma.verification.deleteMany({ where: { userId } }),
      prisma.wallet.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);
  }

  // Verification operations
  async getVerification(id: number): Promise<Verification | undefined> {
    return await prisma.verification.findUnique({ where: { id } });
  }

  async getVerificationByUserId(userId: number): Promise<Verification | undefined> {
    return await prisma.verification.findFirst({ where: { userId } });
  }

  async createVerification(verification: Omit<Verification, 'id' | 'createdAt'>): Promise<Verification> {
    return await prisma.verification.create({ data: verification });
  }

  async updateVerificationStatus(id: number, status: string): Promise<Verification> {
    return await prisma.verification.update({
      where: { id },
      data: { status }
    });
  }

  // Wallet operations
  async getWallet(id: number): Promise<Wallet | undefined> {
    return await prisma.wallet.findUnique({ where: { id } });
  }

  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    return await prisma.wallet.findUnique({ where: { userId } });
  }

  async createWallet(wallet: Omit<Wallet, 'id' | 'createdAt' | 'balance'>): Promise<Wallet> {
    return await prisma.wallet.create({ data: wallet });
  }

  async updateWalletBalance(id: number, amount: number): Promise<Wallet> {
    return await prisma.wallet.update({
      where: { id },
      data: { balance: { increment: amount } }
    });
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return await prisma.transaction.findUnique({ where: { id } });
  }

  async getTransactionsByWalletId(walletId: number): Promise<Transaction[]> {
    return await prisma.transaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    return await prisma.transaction.create({ data: transaction });
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    return await prisma.transaction.update({
      where: { id },
      data: { status }
    });
  }

  // Train operations
  async getTrain(id: number): Promise<Train | undefined> {
    return await prisma.train.findUnique({ where: { id } });
  }

  async getTrainByNumber(trainNumber: string): Promise<Train | undefined> {
    return await prisma.train.findUnique({ where: { trainNumber } });
  }

  async getAllTrains(): Promise<Train[]> {
    return await prisma.train.findMany();
  }

  async createTrain(train: Omit<Train, 'id'>): Promise<Train> {
    return await prisma.train.create({ data: train });
  }

  async updateTrainAvailableSeats(id: number, seats: number): Promise<Train> {
    return await prisma.train.update({
      where: { id },
      data: { availableSeats: seats }
    });
  }

  // Schedule operations
  async getSchedule(id: number): Promise<Schedule | undefined> {
    return await prisma.schedule.findUnique({ where: { id } });
  }

  async getSchedulesByTrainId(trainId: number): Promise<Schedule[]> {
    return await prisma.schedule.findMany({ where: { trainId } });
  }

  async getAllSchedules(): Promise<Schedule[]> {
    return await prisma.schedule.findMany();
  }

  async getSchedulesByJourneyDate(date: string): Promise<Schedule[]> {
    return await prisma.schedule.findMany({ where: { journeyDate: date } });
  }

  async createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt'>): Promise<Schedule> {
    return await prisma.schedule.create({ data: schedule });
  }

  async updateScheduleAvailableSeats(id: number, seats: number): Promise<Schedule> {
    return await prisma.schedule.update({
      where: { id },
      data: { availableSeats: seats }
    });
  }

  // Ticket operations
  async getTicket(id: number): Promise<Ticket | undefined> {
    return await prisma.ticket.findUnique({ where: { id } });
  }

  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    return await prisma.ticket.findMany({ where: { userId } });
  }

  async getTicketByHash(hash: string): Promise<Ticket | undefined> {
    return await prisma.ticket.findFirst({ where: { ticketHash: hash } });
  }

  async getTicketsByScheduleId(scheduleId: number): Promise<Ticket[]> {
    return await prisma.ticket.findMany({ where: { scheduleId } });
  }

  async createTicket(ticket: Omit<Ticket, 'id' | 'issuedAt'>): Promise<Ticket> {
    return await prisma.ticket.create({ data: ticket });
  }

  async updateTicketStatus(id: number, status: string): Promise<Ticket> {
    return await prisma.ticket.update({
      where: { id },
      data: { status }
    });
  }

  async updateTicketPaymentStatus(id: number, status: string, paymentId: string): Promise<Ticket> {
    return await prisma.ticket.update({
      where: { id },
      data: { paymentStatus: status, paymentId }
    });
  }

  // Ticket verification operations
  async getTicketVerification(id: number): Promise<TicketVerification | undefined> {
    return await prisma.ticketVerification.findUnique({ where: { id } });
  }

  async getTicketVerificationsByTicketId(ticketId: number): Promise<TicketVerification[]> {
    return await prisma.ticketVerification.findMany({ where: { ticketId } });
  }

  async createTicketVerification(verification: Omit<TicketVerification, 'id' | 'verifiedAt'>): Promise<TicketVerification> {
    return await prisma.ticketVerification.create({ data: verification });
  }

  // Email verification operations
  async createEmailVerification(userId: number, email: string, verificationCode: string, expiresAt: Date): Promise<EmailVerification> {
    return await prisma.emailVerification.create({
      data: {
        userId,
        email,
        verificationCode,
        expiresAt
      }
    });
  }

  async getEmailVerification(userId: number): Promise<EmailVerification | undefined> {
    return await prisma.emailVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async verifyEmail(userId: number): Promise<EmailVerification> {
    const verification = await this.getEmailVerification(userId);
    if (!verification) {
      throw new Error('No email verification found');
    }
    return await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    });
  }
}

// Export the database storage instance
export const storage = new DbStorage();
