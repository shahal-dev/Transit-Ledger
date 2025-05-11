-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "berth_schedule_id" INTEGER;

-- CreateTable
CREATE TABLE "berths" (
    "id" SERIAL NOT NULL,
    "train_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "coach_number" INTEGER NOT NULL,
    "seats_per_coach" INTEGER NOT NULL DEFAULT 80,
    "total_seats" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berth_schedules" (
    "id" SERIAL NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "berth_id" INTEGER NOT NULL,
    "price_per_seat" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "booked_seats" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berth_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "berths_train_id_coach_number_type_key" ON "berths"("train_id", "coach_number", "type");

-- CreateIndex
CREATE UNIQUE INDEX "berth_schedules_schedule_id_berth_id_key" ON "berth_schedules"("schedule_id", "berth_id");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_berth_schedule_id_fkey" FOREIGN KEY ("berth_schedule_id") REFERENCES "berth_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berths" ADD CONSTRAINT "berths_train_id_fkey" FOREIGN KEY ("train_id") REFERENCES "trains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berth_schedules" ADD CONSTRAINT "berth_schedules_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berth_schedules" ADD CONSTRAINT "berth_schedules_berth_id_fkey" FOREIGN KEY ("berth_id") REFERENCES "berths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
