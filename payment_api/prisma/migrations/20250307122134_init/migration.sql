-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('new', 'pending', 'done');

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "idempotentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "products" TEXT[],
    "totalCost" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotentId_key" ON "Payment"("idempotentId");
