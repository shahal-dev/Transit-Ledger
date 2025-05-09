/*
  Warnings:

  - You are about to drop the column `arrival_time` on the `trains` table. All the data in the column will be lost.
  - You are about to drop the column `available_seats` on the `trains` table. All the data in the column will be lost.
  - You are about to drop the column `departure_time` on the `trains` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `trains` table. All the data in the column will be lost.
  - You are about to drop the column `from_station` on the `trains` table. All the data in the column will be lost.
  - You are about to drop the column `station_id` on the `trains` table. All the data in the column will be lost.
  - You are about to drop the column `to_station` on the `trains` table. All the data in the column will be lost.
  - You are about to drop the column `total_seats` on the `trains` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[seat_schedule_id]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.
*/

-- Create a temporary table to store train information
CREATE TABLE "_temp_train_data" (
    "id" INTEGER,
    "from_station" TEXT,
    "to_station" TEXT,
    "departure_time" TEXT,
    "arrival_time" TEXT
);

-- Store train data before modifying structure
INSERT INTO "_temp_train_data" ("id", "from_station", "to_station", "departure_time", "arrival_time")
SELECT "id", "from_station", "to_station", "departure_time", "arrival_time"
FROM "trains";

-- Insert default stations if they don't exist
INSERT INTO "stations" ("name", "city", "status", "platforms", "created_at", "updated_at")
SELECT DISTINCT t."from_station", 'Unknown', 'operational', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_temp_train_data" t
WHERE NOT EXISTS (
    SELECT 1 FROM "stations" s WHERE s."name" = t."from_station"
);

INSERT INTO "stations" ("name", "city", "status", "platforms", "created_at", "updated_at")
SELECT DISTINCT t."to_station", 'Unknown', 'operational', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "_temp_train_data" t
WHERE NOT EXISTS (
    SELECT 1 FROM "stations" s WHERE s."name" = t."to_station"
);

-- DropForeignKey
ALTER TABLE "trains" DROP CONSTRAINT "trains_station_id_fkey";

-- AlterTable
ALTER TABLE "schedules" 
ADD COLUMN "from_station_id" INTEGER,
ADD COLUMN "to_station_id" INTEGER,
ADD COLUMN "departure_time" TIMESTAMP(3),
ADD COLUMN "arrival_time" TIMESTAMP(3),
ADD COLUMN "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Update schedules with station information
UPDATE "schedules" s
SET 
    "from_station_id" = (
        SELECT st."id" 
        FROM "stations" st 
        WHERE st."name" = (
            SELECT t."from_station" 
            FROM "_temp_train_data" t 
            WHERE t."id" = s."train_id"
        )
    ),
    "to_station_id" = (
        SELECT st."id" 
        FROM "stations" st 
        WHERE st."name" = (
            SELECT t."to_station" 
            FROM "_temp_train_data" t 
            WHERE t."id" = s."train_id"
        )
    ),
    "departure_time" = CAST(CONCAT(s."journey_date", ' ', (
        SELECT t."departure_time" 
        FROM "_temp_train_data" t 
        WHERE t."id" = s."train_id"
    )) AS TIMESTAMP),
    "arrival_time" = CAST(CONCAT(s."journey_date", ' ', (
        SELECT t."arrival_time" 
        FROM "_temp_train_data" t 
        WHERE t."id" = s."train_id"
    )) AS TIMESTAMP);

-- AlterTable - set NOT NULL constraints after data is populated
ALTER TABLE "schedules" 
ALTER COLUMN "from_station_id" SET NOT NULL,
ALTER COLUMN "to_station_id" SET NOT NULL,
ALTER COLUMN "departure_time" SET NOT NULL,
ALTER COLUMN "arrival_time" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN "seat_schedule_id" INTEGER;

-- AlterTable
ALTER TABLE "trains" DROP COLUMN "arrival_time",
DROP COLUMN "available_seats",
DROP COLUMN "departure_time",
DROP COLUMN "duration",
DROP COLUMN "from_station",
DROP COLUMN "station_id",
DROP COLUMN "to_station",
DROP COLUMN "total_seats",
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "seats" (
    "id" SERIAL NOT NULL,
    "train_id" INTEGER NOT NULL,
    "seat_number" TEXT NOT NULL,
    "seat_class" TEXT NOT NULL,
    "car_number" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "features" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_schedules" (
    "id" SERIAL NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "seat_id" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "is_booked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seats_train_id_seat_number_car_number_key" ON "seats"("train_id", "seat_number", "car_number");

-- CreateIndex
CREATE UNIQUE INDEX "seat_schedules_schedule_id_seat_id_key" ON "seat_schedules"("schedule_id", "seat_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_seat_schedule_id_key" ON "tickets"("seat_schedule_id");

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_from_station_id_fkey" FOREIGN KEY ("from_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_to_station_id_fkey" FOREIGN KEY ("to_station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_schedules" ADD CONSTRAINT "seat_schedules_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_schedules" ADD CONSTRAINT "seat_schedules_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_seat_schedule_id_fkey" FOREIGN KEY ("seat_schedule_id") REFERENCES "seat_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop the temporary table
DROP TABLE "_temp_train_data";
