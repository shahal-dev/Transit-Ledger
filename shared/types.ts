export interface Train {
  id: number;
  name: string;
  trainNumber: string;
  type: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
}

export interface Schedule {
  id: number;
  train: Train;
  journeyDate: string;
  availableSeats: number;
  price: number;
}

export interface Ticket {
  id: number;
  userId: number;
  scheduleId: number;
  schedule: Schedule;
  seatNumber: string;
  qrCode: string;
  paymentStatus: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  createdAt: string;
}

export interface Wallet {
  id: number;
  userId: number;
  balance: number;
  transactions: Transaction[];
} 