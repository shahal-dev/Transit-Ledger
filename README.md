# TransitLedger

TransitLedger is a train ticket booking system that allows users to browse train schedules, book tickets, and manage their bookings.

## Features

- User authentication and account management
- Browse train schedules and routes
- Book tickets with seat class selection
- Ticket management (view, cancel)
- Admin dashboard for managing trains, schedules, and seats
- Real-time updates via WebSockets
- QR code generation for ticket verification

## Tech Stack

- **Frontend**: React, TailwindCSS, Radix UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Prisma ORM (using NeonDB)
- **Authentication**: Passport.js
- **Real-time**: WebSockets

## Dockerized Deployment

### Prerequisites

- Docker and Docker Compose installed on your system
- Git
- NeonDB account with a PostgreSQL database

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/TransitLedger.git
   cd TransitLedger
   ```

2. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```
   # Database connection (using NeonDB)
   DATABASE_URL=postgresql://username:password@your-neondb-host.neon.tech/databasename?sslmode=require

   # Security 
   SESSION_SECRET=your-session-secret-here
   JWT_SECRET=your-jwt-secret-here

   # SMTP Configuration 
   SMTP_HOST=smtp.example.com
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-smtp-password
   SMTP_PORT=587
   SMTP_SECURE=false

   # URLs
   FRONTEND_URL=http://localhost:3001
   BASE_URL=http://localhost:3001
   VITE_API_URL=http://localhost:3001
   ```

3. **Deploy with Docker**

   Use our deployment script to automate the process:

   ```bash
   ./scripts/docker-deploy.sh
   ```

   Or manually:

   ```bash
   # Build and start the container
   docker-compose up -d

   # Run database migrations
   docker-compose exec app yarn db:migrate:deploy

   # Seed the database (optional)
   docker-compose exec app yarn db:seed
   ```

4. **Access the application**

   - Web application: http://localhost:3001

### Container

The Docker Compose setup includes one container:

1. **app**: The main application container running the Node.js server and React frontend (connected to your NeonDB PostgreSQL database)

## Development Setup

If you prefer to run the application without Docker for development:

1. **Install dependencies**

   ```bash
   yarn install
   ```

2. **Configure environment variables**

   Create a `.env` file with appropriate values (including your NeonDB connection string)

3. **Generate Prisma client**

   ```bash
   yarn db:generate
   ```

4. **Run migrations**

   ```bash
   yarn db:migrate:deploy
   ```

5. **Seed the database**

   ```bash
   yarn db:seed
   ```

6. **Start the development server**

   ```bash
   yarn dev
   ```

## License

MIT
