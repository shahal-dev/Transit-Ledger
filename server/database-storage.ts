import { IStorage } from "./storage";
import { 
  User, InsertUser, 
  Verification, InsertVerification, 
  Wallet, InsertWallet, 
  Transaction, InsertTransaction, 
  Train, InsertTrain, 
  Schedule, InsertSchedule, 
  Ticket, InsertTicket, 
  TicketVerification, InsertTicketVerification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { 
  users, verifications, wallets, transactions, 
  trains, schedules, tickets, ticketVerifications 
} from "@shared/schema";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByNidHash(nidHash: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.nidHash, nidHash));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values({
      ...user,
      verified: false,
      createdAt: new Date(),
      email: user.email || null
    }).returning();
    return newUser;
  }

  async verifyUser(userId: number): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ verified: true })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return updatedUser;
  }

  // Verification operations
  async getVerification(id: number): Promise<Verification | undefined> {
    const [verification] = await db.select().from(verifications).where(eq(verifications.id, id));
    return verification;
  }

  async getVerificationByUserId(userId: number): Promise<Verification | undefined> {
    const [verification] = await db.select().from(verifications).where(eq(verifications.userId, userId));
    return verification;
  }

  async createVerification(verification: InsertVerification): Promise<Verification> {
    const [newVerification] = await db.insert(verifications).values({
      ...verification,
      status: "pending",
      createdAt: new Date(),
      passportNumber: verification.passportNumber || null
    }).returning();
    return newVerification;
  }

  async updateVerificationStatus(id: number, status: string): Promise<Verification> {
    const [updatedVerification] = await db.update(verifications)
      .set({ status })
      .where(eq(verifications.id, id))
      .returning();
    
    if (!updatedVerification) {
      throw new Error(`Verification with ID ${id} not found`);
    }
    
    return updatedVerification;
  }

  // Wallet operations
  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db.insert(wallets).values({
      ...wallet,
      balance: 0,
      createdAt: new Date()
    }).returning();
    return newWallet;
  }

  async updateWalletBalance(id: number, amount: number): Promise<Wallet> {
    // First get the current wallet to calculate new balance
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    
    if (!wallet) {
      throw new Error(`Wallet with ID ${id} not found`);
    }
    
    const [updatedWallet] = await db.update(wallets)
      .set({ balance: wallet.balance + amount })
      .where(eq(wallets.id, id))
      .returning();
    
    return updatedWallet;
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionsByWalletId(walletId: number): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values({
      ...transaction,
      createdAt: new Date(),
      status: transaction.status || "pending",
      paymentId: transaction.paymentId || null,
      paymentMethod: transaction.paymentMethod || null
    }).returning();
    return newTransaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const [updatedTransaction] = await db.update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    
    if (!updatedTransaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    return updatedTransaction;
  }

  // Train operations
  async getTrain(id: number): Promise<Train | undefined> {
    const [train] = await db.select().from(trains).where(eq(trains.id, id));
    return train;
  }

  async getTrainByNumber(trainNumber: string): Promise<Train | undefined> {
    const [train] = await db.select().from(trains).where(eq(trains.trainNumber, trainNumber));
    return train;
  }

  async getAllTrains(): Promise<Train[]> {
    return db.select().from(trains);
  }

  async createTrain(train: InsertTrain): Promise<Train> {
    const [newTrain] = await db.insert(trains).values({
      ...train,
      status: train.status || "active"
    }).returning();
    return newTrain;
  }

  async updateTrainAvailableSeats(id: number, seats: number): Promise<Train> {
    const [updatedTrain] = await db.update(trains)
      .set({ availableSeats: seats })
      .where(eq(trains.id, id))
      .returning();
    
    if (!updatedTrain) {
      throw new Error(`Train with ID ${id} not found`);
    }
    
    return updatedTrain;
  }

  // Schedule operations
  async getSchedule(id: number): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(eq(schedules.id, id));
    return schedule;
  }

  async getSchedulesByTrainId(trainId: number): Promise<Schedule[]> {
    return db.select().from(schedules).where(eq(schedules.trainId, trainId));
  }

  async getAllSchedules(): Promise<Schedule[]> {
    return db.select().from(schedules);
  }

  async getSchedulesByJourneyDate(date: string): Promise<Schedule[]> {
    return db.select().from(schedules).where(eq(schedules.journeyDate, date));
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const [newSchedule] = await db.insert(schedules).values({
      ...schedule,
      createdAt: new Date(),
      status: schedule.status || "active"
    }).returning();
    return newSchedule;
  }

  async updateScheduleAvailableSeats(id: number, seats: number): Promise<Schedule> {
    const [updatedSchedule] = await db.update(schedules)
      .set({ availableSeats: seats })
      .where(eq(schedules.id, id))
      .returning();
    
    if (!updatedSchedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    
    return updatedSchedule;
  }

  // Ticket operations
  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    return db.select().from(tickets).where(eq(tickets.userId, userId));
  }

  async getTicketByHash(hash: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketHash, hash));
    return ticket;
  }

  async getTicketsByScheduleId(scheduleId: number): Promise<Ticket[]> {
    return db.select().from(tickets).where(eq(tickets.scheduleId, scheduleId));
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    // Generate a random ticket hash and QR code
    const ticketHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const qrCode = `TRANSITLEDGER-${Date.now()}-${ticketHash}`;
    
    const [newTicket] = await db.insert(tickets).values({
      ...ticket,
      ticketHash,
      qrCode,
      price: 150, // Fixed price as per requirements
      issuedAt: new Date(),
      status: "booked",
      metadata: null,
      paymentId: ticket.paymentId || null,
      paymentStatus: ticket.paymentStatus || "pending"
    }).returning();
    
    return newTicket;
  }

  async updateTicketStatus(id: number, status: string): Promise<Ticket> {
    const [updatedTicket] = await db.update(tickets)
      .set({ status })
      .where(eq(tickets.id, id))
      .returning();
    
    if (!updatedTicket) {
      throw new Error(`Ticket with ID ${id} not found`);
    }
    
    return updatedTicket;
  }

  async updateTicketPaymentStatus(id: number, status: string, paymentId: string): Promise<Ticket> {
    const [updatedTicket] = await db.update(tickets)
      .set({ paymentStatus: status, paymentId })
      .where(eq(tickets.id, id))
      .returning();
    
    if (!updatedTicket) {
      throw new Error(`Ticket with ID ${id} not found`);
    }
    
    return updatedTicket;
  }

  // Ticket verification operations
  async getTicketVerification(id: number): Promise<TicketVerification | undefined> {
    const [verification] = await db.select().from(ticketVerifications).where(eq(ticketVerifications.id, id));
    return verification;
  }

  async getTicketVerificationsByTicketId(ticketId: number): Promise<TicketVerification[]> {
    return db.select().from(ticketVerifications).where(eq(ticketVerifications.ticketId, ticketId));
  }

  async createTicketVerification(verification: InsertTicketVerification): Promise<TicketVerification> {
    const [newVerification] = await db.insert(ticketVerifications).values({
      ...verification,
      verifiedAt: new Date(),
      location: verification.location || null
    }).returning();
    
    return newVerification;
  }
}