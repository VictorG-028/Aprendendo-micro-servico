-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "idempotentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "products" TEXT[],
    "quantities" INTEGER[],
    "unitPrices" DOUBLE PRECISION[],
    "totalCost" DOUBLE PRECISION NOT NULL,
    "isPending" BOOLEAN NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotentId_key" ON "Payment"("idempotentId");
